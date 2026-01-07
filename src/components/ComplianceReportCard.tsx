'use client'

import React, { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi'
import { ComplianceReport } from '@/types'
import { cn } from '@/lib/utils'

interface ComplianceReportCardProps {
  report: ComplianceReport | null
}

export default function ComplianceReportCard({ report }: ComplianceReportCardProps) {
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)

  if (!report) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <FiCheckCircle size={48} className="mb-4 text-gray-300" />
        <p className="text-sm text-gray-500">
          Compliance report will appear here
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Available after policy generation
        </p>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <FiAlertCircle size={16} className="text-red-600" />
      case 'warning':
        return <FiAlertCircle size={16} className="text-yellow-600" />
      case 'info':
        return <FiInfo size={16} className="text-blue-600" />
      default:
        return <FiCheckCircle size={16} className="text-green-600" />
    }
  }

  const getStatusBadgeColor = (level: string) => {
    switch (level) {
      case 'Compliant':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Minor Issues':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Major Issues':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header with Score */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Compliance Report</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeColor(
              report.level
            )}`}
          >
            {report.level}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-blue-600">{report.score}%</p>
            <p className="text-xs text-gray-500">Compliance Score</p>
          </div>
          <div className="flex-1 bg-gray-300 rounded-full h-2">
            <div
              className={`h-full rounded-full transition-all ${
                report.score >= 80
                  ? 'bg-green-500'
                  : report.score >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${report.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Findings */}
        {report.findings.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Findings ({report.findings.length})
              </h4>

              <div className="space-y-2">
                {report.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className={`rounded-lg border p-3 transition-all cursor-pointer hover:shadow-sm ${getSeverityColor(
                      finding.severity
                    )}`}
                  >
                    <div
                      onClick={() =>
                        setExpandedFinding(
                          expandedFinding === finding.id ? null : finding.id
                        )
                      }
                      className="flex items-start justify-between"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(finding.severity)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{finding.title}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {finding.description}
                          </p>
                        </div>
                      </div>

                      {expandedFinding === finding.id ? (
                        <FiChevronUp size={16} className="flex-shrink-0 ml-2" />
                      ) : (
                        <FiChevronDown size={16} className="flex-shrink-0 ml-2" />
                      )}
                    </div>

                    {expandedFinding === finding.id && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <p className="text-xs font-semibold opacity-75 mb-1">
                          Recommendation:
                        </p>
                        <p className="text-xs opacity-75">
                          {finding.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="px-6 py-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Recommendations
            </h4>

            <ul className="space-y-2">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="text-blue-600 flex-shrink-0 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.findings.length === 0 && report.recommendations.length === 0 && (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <p className="text-sm">No findings or recommendations</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-500">
        Last checked: {report.lastChecked.toLocaleString()}
      </div>
    </div>
  )
}
