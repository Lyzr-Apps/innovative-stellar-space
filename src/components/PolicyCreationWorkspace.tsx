'use client'

import React, { useState, useCallback } from 'react'
import { FiDownload, FiEdit2, FiCheck } from 'react-icons/fi'
import { ChatMessage, PolicyCreationState, PolicyRequirement, Policy, ComplianceReport } from '@/types'
import ChatInterface from './ChatInterface'
import ProgressTracker from './ProgressTracker'
import RequirementsSummary from './RequirementsSummary'
import PolicyOutputPanel from './PolicyOutputPanel'
import ComplianceReportCard from './ComplianceReportCard'
import { sendMessage, formatAgentResponse, extractRequirements, extractPolicyContent, extractComplianceFindings } from '@/lib/api'

interface PolicyCreationWorkspaceProps {
  onBack: () => void
}

export default function PolicyCreationWorkspace({ onBack }: PolicyCreationWorkspaceProps) {
  const [state, setState] = useState<PolicyCreationState>({
    stage: 'Discovery',
    requirements: null,
    policy: null,
    complianceReport: null,
    isLoading: false,
    error: null,
  })

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeTab, setActiveTab] = useState<'output' | 'compliance'>('output')
  const [userId] = useState(`user-${Date.now()}`)
  const [sessionId] = useState(`session-${Date.now()}`)

  const addMessage = useCallback((role: 'user' | 'agent', content: string, agentName?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role,
        content,
        timestamp: new Date(),
        agentName,
      },
    ])
  }, [])

  const handleSendMessage = useCallback(
    async (userMessage: string) => {
      // Add user message
      addMessage('user', userMessage)

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        // Determine which agent to use based on stage
        let agentId = '695e154732e7bb62a51c839b' // Discovery Agent
        let agentName = 'Discovery Agent'

        if (state.stage === 'Generation') {
          agentId = '695e154728a3f341188e00dc' // Generator Agent
          agentName = 'Policy Generator'
        } else if (state.stage === 'Compliance') {
          agentId = '695e154752ab53b7bf377c14' // Compliance Agent
          agentName = 'Compliance Checker'
        }

        const response = await sendMessage(agentId, userMessage, userId, sessionId)

        if (response.success) {
          const content = formatAgentResponse(response)
          addMessage('agent', content, agentName)

          // Process response based on stage
          if (state.stage === 'Discovery') {
            const requirements = extractRequirements(response)
            setState((prev) => ({
              ...prev,
              requirements: {
                policyType: requirements.policyType || 'General Policy',
                scope: requirements.scope || 'All Employees',
                stakeholders: requirements.stakeholders || [],
                keyProvisions: requirements.keyProvisions || [],
                edgeCases: requirements.edgeCases || [],
              },
            }))
          } else if (state.stage === 'Generation') {
            const policyContent = extractPolicyContent(response)
            setState((prev) => ({
              ...prev,
              policy: {
                id: `policy-${Date.now()}`,
                title: prev.requirements?.policyType || 'New Policy',
                content: policyContent,
                status: 'Draft',
                dateCreated: new Date(),
                lastModified: new Date(),
                policyType: prev.requirements?.policyType || 'General',
                scope: prev.requirements?.scope || 'All Employees',
              },
            }))
          } else if (state.stage === 'Compliance') {
            const findings = extractComplianceFindings(response)
            setState((prev) => ({
              ...prev,
              complianceReport: {
                score: findings.score,
                level: findings.level,
                findings: findings.findings.map((f, idx) => ({
                  id: `finding-${idx}`,
                  severity: f.severity as 'critical' | 'warning' | 'info',
                  title: f.title,
                  description: f.description,
                  recommendation: f.recommendation || 'Review and address this issue',
                })),
                recommendations: [
                  'Address all critical findings before deployment',
                  'Schedule a compliance review meeting with stakeholders',
                  'Implement recommended changes',
                ],
                lastChecked: new Date(),
              },
            }))
          }
        } else {
          setState((prev) => ({
            ...prev,
            error: 'Failed to get response from agent',
          }))
          addMessage('agent', 'I encountered an error processing your request. Please try again.')
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setState((prev) => ({
          ...prev,
          error: errorMsg,
        }))
        addMessage('agent', `Error: ${errorMsg}`)
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [state.stage, state.requirements, userId, sessionId, addMessage]
  )

  const handleAdvanceStage = () => {
    const stages: PolicyCreationState['stage'][] = ['Discovery', 'Generation', 'Compliance']
    const currentIndex = stages.indexOf(state.stage)
    if (currentIndex < stages.length - 1) {
      setState((prev) => ({
        ...prev,
        stage: stages[currentIndex + 1],
      }))
      addMessage('agent', `Moving to ${stages[currentIndex + 1]} phase. Ready when you are!`)
    }
  }

  const handleDownloadPDF = () => {
    if (!state.policy) return

    const pdfContent = `
      ${state.policy.title}
      Generated: ${new Date().toLocaleDateString()}

      ${state.policy.content}
    `

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(pdfContent))
    element.setAttribute('download', `${state.policy.title.replace(/\s+/g, '-')}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleApprovePolicy = () => {
    if (state.policy) {
      setState((prev) => ({
        ...prev,
        policy: {
          ...prev.policy!,
          status: 'Compliant',
        },
      }))
      addMessage('agent', 'Policy has been approved and marked as compliant!')
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header with Back Button */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Policy</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete the workflow to generate a compliant policy
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <ProgressTracker currentStage={state.stage} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        {/* Requirements Summary */}
        <RequirementsSummary requirements={state.requirements} />

        {/* Split Layout: Chat (60%) and Output (40%) */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Left Side - Chat */}
          <div className="flex-[0.6] min-w-0">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={state.isLoading}
              placeholder={`Ask about ${state.stage.toLowerCase()} requirements...`}
            />
          </div>

          {/* Right Side - Output/Compliance Tabs */}
          <div className="flex-[0.4] min-w-0 flex flex-col">
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => setActiveTab('output')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'output'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Policy Output
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'compliance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Compliance
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0">
              {activeTab === 'output' ? (
                <PolicyOutputPanel
                  policy={state.policy}
                  onDownloadPDF={handleDownloadPDF}
                />
              ) : (
                <ComplianceReportCard report={state.complianceReport} />
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={handleDownloadPDF}
            disabled={!state.policy}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 font-medium transition-colors"
          >
            <FiDownload size={18} />
            Download PDF
          </button>

          <button
            onClick={() => {
              // Toggle edit mode in policy panel
              alert('Edit mode would be toggled here')
            }}
            disabled={!state.policy}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 font-medium transition-colors"
          >
            <FiEdit2 size={18} />
            Edit Draft
          </button>

          <button
            onClick={handleApprovePolicy}
            disabled={!state.policy || state.policy.status === 'Compliant'}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 font-medium transition-colors ml-auto"
          >
            <FiCheck size={18} />
            {state.policy?.status === 'Compliant' ? 'Approved' : 'Approve Policy'}
          </button>

          {state.stage !== 'Compliance' && (
            <button
              onClick={handleAdvanceStage}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium transition-colors"
            >
              Next Phase
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
