'use client'

import React from 'react'
import { FiSearch, FiEdit3, FiCheckCircle } from 'react-icons/fi'
import { WorkflowStage } from '@/types'

interface ProgressTrackerProps {
  currentStage: WorkflowStage
}

export default function ProgressTracker({ currentStage }: ProgressTrackerProps) {
  const stages: { id: WorkflowStage; label: string; icon: React.ReactNode }[] = [
    {
      id: 'Discovery',
      label: 'Discovery',
      icon: <FiSearch size={20} />,
    },
    {
      id: 'Generation',
      label: 'Generation',
      icon: <FiEdit3 size={20} />,
    },
    {
      id: 'Compliance',
      label: 'Compliance',
      icon: <FiCheckCircle size={20} />,
    },
  ]

  const currentIndex = stages.findIndex((s) => s.id === currentStage)

  return (
    <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isUpcoming = index > currentIndex

        return (
          <div key={stage.id} className="flex items-center flex-1">
            {/* Stage Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 text-green-500'
                    : 'border-gray-300 bg-gray-50 text-gray-400'
                }`}
              >
                {stage.icon}
              </div>
              <p
                className={`mt-2 text-xs font-semibold transition-colors ${
                  isCurrent
                    ? 'text-blue-600'
                    : isCompleted
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {stage.label}
              </p>
            </div>

            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className="flex-1 mx-2">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
