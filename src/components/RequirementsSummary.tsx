'use client'

import React, { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi'
import { PolicyRequirement } from '@/types'

interface RequirementsSummaryProps {
  requirements: PolicyRequirement | null
  onEdit?: () => void
}

export default function RequirementsSummary({
  requirements,
  onEdit,
}: RequirementsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!requirements) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-500">
          Requirements will appear here as discovery progresses
        </p>
      </div>
    )
  }

  const sections = [
    {
      title: 'Policy Type',
      value: requirements.policyType || 'Not specified',
      items: null,
    },
    {
      title: 'Scope',
      value: requirements.scope || 'Not specified',
      items: null,
    },
    {
      title: 'Stakeholders',
      value: null,
      items: requirements.stakeholders || [],
    },
    {
      title: 'Key Provisions',
      value: null,
      items: requirements.keyProvisions || [],
    },
    {
      title: 'Edge Cases',
      value: null,
      items: requirements.edgeCases || [],
    },
  ]

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
      >
        <h3 className="font-semibold text-gray-900">Requirements Summary</h3>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Edit requirements"
            >
              <FiEdit2 size={16} className="text-gray-600" />
            </button>
          )}
          {isExpanded ? (
            <FiChevronUp size={20} className="text-gray-600" />
          ) : (
            <FiChevronDown size={20} className="text-gray-600" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="pb-4 last:pb-0 border-b last:border-b-0 border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                {section.title}
              </h4>

              {section.value && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                  {section.value}
                </p>
              )}

              {section.items && section.items.length > 0 && (
                <ul className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2"
                    >
                      <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.items && section.items.length === 0 && (
                <p className="text-sm text-gray-400 italic">None specified</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
