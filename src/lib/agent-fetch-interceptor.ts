'use client'

/**
 * Global Fetch Interceptor for /api/agent calls
 *
 * Detects parse failures and auto-sends errors to parent iframe
 * Works even when AI-generated code uses raw fetch() instead of useAgent hook
 */

import { isInIframe, sendErrorToParent } from '@/components/ErrorBoundary'

interface ErrorDetails {
  type: 'react_error' | 'api_error' | 'parse_error' | 'network_error' | 'unknown'
  message: string
  stack?: string
  raw_response?: string
  endpoint?: string
  timestamp: string
  userAgent: string
  url: string
}

// Store original fetch
const originalFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : null

// Track if interceptor is installed
let interceptorInstalled = false

// Track sent errors to prevent duplicate notifications
const sentErrorTypes = new Set<string>()

/**
 * Generate a unique key for an error to detect duplicates
 */
function getErrorKey(errorType: string, message: string): string {
  return `${errorType}:${message.substring(0, 50)}`
}

/**
 * Check if this error was already sent to parent
 */
function wasErrorAlreadySent(errorType: string, message: string): boolean {
  const key = getErrorKey(errorType, message)
  return sentErrorTypes.has(key)
}

/**
 * Mark error as sent
 */
function markErrorAsSent(errorType: string, message: string): void {
  const key = getErrorKey(errorType, message)
  sentErrorTypes.add(key)
}

/**
 * Clear sent errors (call this on page navigation or new session)
 */
export function clearSentErrors(): void {
  sentErrorTypes.clear()
}

/**
 * Detect if a response has issues that need fixing
 *
 * IMPORTANT: We now ONLY flag actual errors, not "expected" parse situations.
 * If raw_response exists and has valid data, that's the CORRECT behavior - not an error.
 */
function detectResponseIssue(data: any): { hasIssue: boolean; error: ErrorDetails | null } {
  // Case 1: API-level failure with NO fallback data
  // This is a real error - API failed and there's nothing to show
  if (data.success === false && data.error) {
    // If there's valid raw_response, the UI CAN work - not a critical error
    const hasValidRaw = data.raw_response && data.raw_response.length > 10
    if (hasValidRaw) {
      // raw_response exists - UI should use it. This is expected behavior, not an error.
      console.log('[AgentInterceptor] API returned success:false but raw_response is available - UI should use raw_response')
      return { hasIssue: false, error: null }
    }

    // No fallback - this is a real error
    return {
      hasIssue: true,
      error: {
        type: 'api_error',
        message: data.error,
        raw_response: data.details || data.raw_response,
        endpoint: '/api/agent',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    }
  }

  // Case 2: Parse failure indicated by _parse_succeeded flag
  // IMPORTANT: If raw_response has valid data, this is NOT an error!
  // The expected fix is to use raw_response directly.
  if (data._parse_succeeded === false) {
    const hasValidRaw = data.raw_response && data.raw_response.length > 10
    if (hasValidRaw) {
      // This is EXPECTED - UI should render raw_response. Not an error.
      console.log('[AgentInterceptor] Parse failed but raw_response is valid - this is expected, UI should use raw_response')
      return { hasIssue: false, error: null }
    }

    // No valid raw_response - this IS a problem
    return {
      hasIssue: true,
      error: {
        type: 'parse_error',
        message: 'JSON parsing failed and no valid raw_response fallback',
        raw_response: data.raw_response,
        endpoint: '/api/agent',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    }
  }

  // Case 3: Response has error field but check for fallback
  if (data.response && typeof data.response === 'object') {
    if (data.response.success === false && data.response.error) {
      const hasValidRaw = data.raw_response && data.raw_response.length > 10
      if (hasValidRaw) {
        // raw_response exists - UI can work. Not an error.
        console.log('[AgentInterceptor] Response.success=false but raw_response is valid - UI should use raw_response')
        return { hasIssue: false, error: null }
      }

      // No fallback - real error
      return {
        hasIssue: true,
        error: {
          type: 'parse_error',
          message: data.response.error,
          raw_response: data.raw_response,
          endpoint: '/api/agent',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }
      }
    }
  }

  return { hasIssue: false, error: null }
}

/**
 * Generate fix prompt for parent app
 */
function generateFixPrompt(error: ErrorDetails, fullResponse: any): string {
  let prompt = `## SIMPLE FIX REQUIRED\n\n`
  prompt += `The agent returned a plain text response (not JSON). The UI is trying to parse it as JSON and failing.\n\n`
  prompt += `**Error Type:** ${error.type}\n\n`
  prompt += `**The raw_response contains the actual message:**\n\`\`\`\n${error.raw_response?.substring(0, 500)}\n\`\`\`\n\n`
  prompt += `## THE FIX (do this exactly):\n\n`
  prompt += `In app/page.tsx, when displaying the response, check for \`raw_response\` and render it directly:\n\n`
  prompt += `\`\`\`tsx\n`
  prompt += `// Instead of trying to parse JSON, just use raw_response:\n`
  prompt += `const message = data.raw_response || data.response?.message || data.response || 'No response'\n`
  prompt += `\n`
  prompt += `// Then render it:\n`
  prompt += `<div>{message}</div>\n`
  prompt += `\`\`\`\n\n`
  prompt += `**DO NOT** try complex JSON parsing. The response is plain text - just render \`raw_response\` directly.`
  return prompt
}

/**
 * Send error to parent iframe (auto-send, no modal)
 * Includes deduplication to prevent repeated notifications
 */
function sendErrorToParentWithFix(error: ErrorDetails, fullResponse: any): void {
  if (!isInIframe()) {
    console.log('[AgentInterceptor] Not in iframe, skipping parent notification')
    return
  }

  // Check if we already sent this exact error
  if (wasErrorAlreadySent(error.type, error.message)) {
    console.log('[AgentInterceptor] Skipping duplicate error notification:', error.type)
    return
  }

  // Mark as sent to prevent duplicates
  markErrorAsSent(error.type, error.message)

  // Send error notification to parent (like ErrorBoundary does)
  sendErrorToParent(error)

  // Also send FIX_ERROR_REQUEST with fix prompt
  try {
    window.parent.postMessage(
      {
        type: 'FIX_ERROR_REQUEST',
        source: 'architect-child-app',
        payload: {
          ...error,
          action: 'auto_detected',
          fixPrompt: generateFixPrompt(error, fullResponse),
          fullResponse: fullResponse ? JSON.stringify(fullResponse).substring(0, 2000) : null,
        },
      },
      '*'
    )
    console.log('[AgentInterceptor] Error auto-sent to parent:', error.type)
  } catch (e) {
    console.error('[AgentInterceptor] Failed to send error to parent:', e)
  }
}

/**
 * Intercepted fetch function
 */
async function interceptedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if (!originalFetch) {
    throw new Error('Fetch not available')
  }

  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

  // Only intercept /api/agent calls
  if (!url.includes('/api/agent')) {
    return originalFetch(input, init)
  }

  console.log('[AgentInterceptor] Intercepting /api/agent call')

  try {
    const response = await originalFetch(input, init)

    // Clone response so we can read it without consuming
    const clonedResponse = response.clone()

    // Try to detect issues in the response
    try {
      const data = await clonedResponse.json()

      const { hasIssue, error } = detectResponseIssue(data)

      if (hasIssue && error) {
        console.warn('[AgentInterceptor] Detected response issue:', error.type)

        // Auto-send to parent (no internal modal)
        sendErrorToParentWithFix(error, data)

        // Still return the original response so UI can try to use it
      }
    } catch (jsonError) {
      // Response isn't JSON - that's fine, just continue
    }

    return response

  } catch (networkError) {
    console.error('[AgentInterceptor] Network error:', networkError)

    // Create error details for network error
    const error: ErrorDetails = {
      type: 'network_error',
      message: networkError instanceof Error ? networkError.message : 'Network request failed',
      endpoint: '/api/agent',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // Auto-send to parent
    sendErrorToParentWithFix(error, null)

    throw networkError
  }
}

/**
 * Install the global fetch interceptor
 * Call this once in your app (e.g., in layout.tsx or _app.tsx)
 */
export function installAgentInterceptor(): void {
  if (typeof window === 'undefined') return
  if (interceptorInstalled) return
  if (!originalFetch) return

  window.fetch = interceptedFetch as typeof fetch
  interceptorInstalled = true
  console.log('[AgentInterceptor] Installed global fetch interceptor for /api/agent')
}

/**
 * Uninstall the interceptor (restore original fetch)
 */
export function uninstallAgentInterceptor(): void {
  if (typeof window === 'undefined') return
  if (!interceptorInstalled) return
  if (!originalFetch) return

  window.fetch = originalFetch
  interceptorInstalled = false
  console.log('[AgentInterceptor] Uninstalled fetch interceptor')
}

/**
 * Check if interceptor is installed
 */
export function isInterceptorInstalled(): boolean {
  return interceptorInstalled
}
