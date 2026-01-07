/**
 * Build Error Detector
 *
 * Detects Next.js build/compilation errors and sends them to parent iframe.
 * This runs BEFORE React loads, catching errors that ErrorBoundary can't see.
 */

const isInIframe = (): boolean => {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

interface BuildError {
  type: 'build_error'
  message: string
  file?: string
  line?: string
  details?: string
  timestamp: string
  url: string
}

// Track sent errors to prevent duplicates
const sentErrors = new Set<string>()

function sendBuildErrorToParent(error: BuildError): void {
  if (!isInIframe()) return

  // Dedupe by message
  const key = error.message.substring(0, 100)
  if (sentErrors.has(key)) return
  sentErrors.add(key)

  try {
    // Send as CHILD_APP_ERROR (same format as ErrorBoundary)
    window.parent.postMessage({
      type: 'CHILD_APP_ERROR',
      source: 'architect-child-app',
      payload: {
        type: 'build_error',
        message: error.message,
        stack: error.details,
        timestamp: error.timestamp,
        userAgent: navigator.userAgent,
        url: error.url,
      },
    }, '*')

    // Also send FIX_ERROR_REQUEST with fix prompt
    window.parent.postMessage({
      type: 'FIX_ERROR_REQUEST',
      source: 'architect-child-app',
      payload: {
        type: 'build_error',
        message: error.message,
        action: 'auto_detected',
        fixPrompt: generateBuildFixPrompt(error),
        timestamp: error.timestamp,
        url: error.url,
      },
    }, '*')

    console.log('[BuildErrorDetector] Build error sent to parent:', error.message.substring(0, 100))
  } catch (e) {
    console.error('[BuildErrorDetector] Failed to send error:', e)
  }
}

function generateBuildFixPrompt(error: BuildError): string {
  let prompt = `## BUILD ERROR - Fix Required\n\n`
  prompt += `**Error:** ${error.message}\n\n`

  if (error.file) {
    prompt += `**File:** ${error.file}\n`
  }
  if (error.line) {
    prompt += `**Line:** ${error.line}\n`
  }

  // Common fixes based on error type
  if (error.message.includes("Module not found") || error.message.includes("Can't resolve")) {
    const match = error.message.match(/Can't resolve '([^']+)'/)
    const missingModule = match ? match[1] : 'unknown'

    prompt += `\n## THE FIX:\n`
    prompt += `The import '${missingModule}' does not exist. Either:\n`
    prompt += `1. **Create the missing file** at the expected path\n`
    prompt += `2. **Remove the import** if it's not needed\n`
    prompt += `3. **Fix the import path** if it's pointing to wrong location\n\n`
    prompt += `**DO NOT** import components you haven't created!\n`
  } else if (error.message.includes("SyntaxError") || error.message.includes("Parsing error")) {
    prompt += `\n## THE FIX:\n`
    prompt += `There's a syntax error in the code. Check for:\n`
    prompt += `- Missing brackets, parentheses, or braces\n`
    prompt += `- Unclosed strings or template literals\n`
    prompt += `- Invalid JSX syntax\n`
  } else if (error.message.includes("Type error") || error.message.includes("TypeError")) {
    prompt += `\n## THE FIX:\n`
    prompt += `There's a TypeScript type error. Check the types and interfaces.\n`
  }

  if (error.details) {
    prompt += `\n**Full Error:**\n\`\`\`\n${error.details.substring(0, 1500)}\n\`\`\`\n`
  }

  return prompt
}

function extractErrorFromNextJSOverlay(): BuildError | null {
  // Next.js 13+ error overlay selectors
  const selectors = [
    // Next.js error overlay (dev mode)
    '[data-nextjs-dialog-content]',
    'nextjs-portal',
    '#__next-build-watcher',
    // Error message containers
    '[class*="nextjs-container-errors"]',
    '[class*="error-overlay"]',
    'body > nextjs-portal',
  ]

  // Try to find Next.js error overlay
  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      const text = element.textContent || element.innerText || ''
      if (text.includes('error') || text.includes('Error') || text.includes("Can't resolve")) {
        return {
          type: 'build_error',
          message: text.substring(0, 500),
          details: text,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }
      }
    }
  }

  // Check for error in document title
  if (document.title.includes('Error') || document.title.includes('error')) {
    const bodyText = document.body?.innerText || ''
    if (bodyText.includes("Module not found") || bodyText.includes("Can't resolve") || bodyText.includes("Build Error")) {
      // Extract file and module info
      const moduleMatch = bodyText.match(/Can't resolve '([^']+)'/)
      const fileMatch = bodyText.match(/\.\/([^\s]+\.tsx?)/)

      return {
        type: 'build_error',
        message: moduleMatch ? `Module not found: Can't resolve '${moduleMatch[1]}'` : 'Build Error',
        file: fileMatch ? fileMatch[1] : undefined,
        details: bodyText.substring(0, 2000),
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }
    }
  }

  // Check for visible error text in body
  const bodyText = document.body?.innerText || ''
  if (bodyText.includes("Module not found") || bodyText.includes("Build Error")) {
    const moduleMatch = bodyText.match(/Can't resolve '([^']+)'/)
    const fileMatch = bodyText.match(/\.\/([^\s]+\.tsx?)/)

    return {
      type: 'build_error',
      message: moduleMatch ? `Module not found: Can't resolve '${moduleMatch[1]}'` : 'Build Error',
      file: fileMatch ? fileMatch[1] : undefined,
      details: bodyText.substring(0, 2000),
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }
  }

  return null
}

function checkForBuildErrors(): void {
  const error = extractErrorFromNextJSOverlay()
  if (error) {
    sendBuildErrorToParent(error)
  }
}

// Initialize build error detection
export function initBuildErrorDetector(): void {
  if (typeof window === 'undefined') return
  if (!isInIframe()) return

  console.log('[BuildErrorDetector] Initializing...')

  // Check immediately
  checkForBuildErrors()

  // Check after DOM loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForBuildErrors)
  }

  // Check after full load
  window.addEventListener('load', checkForBuildErrors)

  // Watch for DOM changes (Next.js injects error overlay dynamically)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        // Check if any added node might be an error overlay
        checkForBuildErrors()
      }
    }
  })

  // Start observing once body exists
  const startObserving = () => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    } else {
      setTimeout(startObserving, 100)
    }
  }
  startObserving()

  // Also check periodically for first few seconds
  let checks = 0
  const interval = setInterval(() => {
    checkForBuildErrors()
    checks++
    if (checks > 10) clearInterval(interval)
  }, 500)
}

// Auto-initialize
if (typeof window !== 'undefined') {
  initBuildErrorDetector()
}

export default initBuildErrorDetector
