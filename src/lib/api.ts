import { ChatMessage } from '@/types'

const AGENT_IDS = {
  POLICY_CREATION_MANAGER: '695e154d52ab53b7bf377c15',
  POLICY_DISCOVERY_AGENT: '695e154732e7bb62a51c839b',
  POLICY_GENERATOR_AGENT: '695e154728a3f341188e00dc',
  COMPLIANCE_CHECKER_AGENT: '695e154752ab53b7bf377c14',
}

export interface AgentResponse {
  success: boolean
  response: any
  raw_response?: string
  agent_id: string
  user_id?: string
  session_id?: string
  timestamp: string
}

/**
 * Send a message to an agent
 */
export async function sendMessage(
  agentId: string,
  message: string,
  userId?: string,
  sessionId?: string
): Promise<AgentResponse> {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: agentId,
      message,
      user_id: userId,
      session_id: sessionId,
    }),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Send discovery request to Policy Discovery Agent
 */
export async function sendDiscoveryRequest(
  policyType: string,
  scope: string,
  userId?: string,
  sessionId?: string
): Promise<AgentResponse> {
  const message = `Discover requirements for a ${policyType} policy with scope: ${scope}`
  return sendMessage(
    AGENT_IDS.POLICY_DISCOVERY_AGENT,
    message,
    userId,
    sessionId
  )
}

/**
 * Send generation request to Policy Generator Agent
 */
export async function sendGenerationRequest(
  requirements: string,
  userId?: string,
  sessionId?: string
): Promise<AgentResponse> {
  const message = `Generate a comprehensive policy based on these requirements: ${requirements}`
  return sendMessage(
    AGENT_IDS.POLICY_GENERATOR_AGENT,
    message,
    userId,
    sessionId
  )
}

/**
 * Send compliance check request to Compliance Checker Agent
 */
export async function sendComplianceRequest(
  policyContent: string,
  userId?: string,
  sessionId?: string
): Promise<AgentResponse> {
  const message = `Check compliance for this policy: ${policyContent}`
  return sendMessage(
    AGENT_IDS.COMPLIANCE_CHECKER_AGENT,
    message,
    userId,
    sessionId
  )
}

/**
 * Format agent response to extract useful content
 */
export function formatAgentResponse(response: AgentResponse): string {
  if (typeof response.response === 'string') {
    return response.response
  }
  if (typeof response.response === 'object' && response.response !== null) {
    return JSON.stringify(response.response, null, 2)
  }
  return response.raw_response || 'No response received'
}

/**
 * Convert chat messages to markdown format for document export
 */
export function chatToMarkdown(messages: ChatMessage[]): string {
  return messages
    .map((msg) => {
      const role = msg.role === 'user' ? 'User' : msg.agentName || 'Agent'
      const time = msg.timestamp.toLocaleTimeString()
      return `**${role}** (${time})\n${msg.content}`
    })
    .join('\n\n')
}

/**
 * Extract policy requirements from discovery response
 */
export function extractRequirements(discoveryResponse: AgentResponse): Record<string, any> {
  const response = discoveryResponse.response
  if (typeof response === 'object' && response !== null) {
    return response
  }
  try {
    return JSON.parse(typeof response === 'string' ? response : '{}')
  } catch {
    return {}
  }
}

/**
 * Extract policy content from generation response
 */
export function extractPolicyContent(generationResponse: AgentResponse): string {
  const response = generationResponse.response
  if (typeof response === 'string') {
    return response
  }
  if (typeof response === 'object' && response !== null) {
    if ('content' in response) return response.content
    if ('policy' in response) return response.policy
    return JSON.stringify(response, null, 2)
  }
  return ''
}

/**
 * Extract compliance findings from compliance response
 */
export function extractComplianceFindings(
  complianceResponse: AgentResponse
): {
  level: 'Compliant' | 'Minor Issues' | 'Major Issues'
  findings: Array<{ severity: string; title: string; description: string }>
  score: number
} {
  const response = complianceResponse.response
  if (typeof response === 'object' && response !== null) {
    return {
      level: response.level || 'Compliant',
      findings: response.findings || [],
      score: response.score || 100,
    }
  }
  return {
    level: 'Compliant',
    findings: [],
    score: 100,
  }
}

export const AGENT_IDS_EXPORT = AGENT_IDS
