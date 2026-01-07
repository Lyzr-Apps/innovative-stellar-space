'use client'

import React, { useState } from 'react'
import { FiDownload, FiEdit2, FiFileText } from 'react-icons/fi'
import { Policy } from '@/types'

interface PolicyOutputPanelProps {
  policy: Policy | null
  onDownloadPDF?: () => void
  onEdit?: () => void
}

export default function PolicyOutputPanel({
  policy,
  onDownloadPDF,
  onEdit,
}: PolicyOutputPanelProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState(policy?.content || '')

  if (!policy) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <FiFileText size={48} className="mb-4 text-gray-300" />
        <p className="text-sm text-gray-500">
          Policy content will appear here
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Complete the discovery and generation phases
        </p>
      </div>
    )
  }

  const handleSaveEdit = () => {
    setIsEditMode(false)
    if (onEdit) {
      onEdit()
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div>
          <h3 className="font-semibold text-gray-900">{policy.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            Status: {policy.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 text-sm transition-colors"
          >
            <FiEdit2 size={16} />
            {isEditMode ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={onDownloadPDF}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm transition-colors"
          >
            <FiDownload size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isEditMode ? (
          <div className="space-y-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditMode(false)
                  setEditedContent(policy.content)
                }}
                className="rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {policy.content.split('\n\n').map((paragraph, idx) => {
              // Check if this looks like a section header
              if (paragraph.trim().match(/^#{1,3}\s/) || paragraph.trim().match(/^[A-Z][A-Z\s]+$/)) {
                return (
                  <h3 key={idx} className="mt-6 mb-3 font-bold text-lg text-gray-900">
                    {paragraph.replace(/^#{1,3}\s/, '').trim()}
                  </h3>
                )
              }

              // Check if this looks like a list
              if (paragraph.trim().match(/^[-*•]/)) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-2 text-gray-700">
                    {paragraph
                      .split('\n')
                      .filter((line) => line.trim())
                      .map((line, lineIdx) => (
                        <li key={lineIdx} className="text-sm">
                          {line.replace(/^[-*•]\s*/, '').trim()}
                        </li>
                      ))}
                  </ul>
                )
              }

              return (
                <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>
            Created: {policy.dateCreated.toLocaleDateString()}
          </span>
          <span>
            Last modified: {policy.lastModified.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
