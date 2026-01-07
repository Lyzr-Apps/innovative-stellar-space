'use client'

import React from 'react'
import {
  FiArrowRight,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit3,
  FiTrendingUp,
} from 'react-icons/fi'
import { Policy } from '@/types'

interface DashboardProps {
  onCreatePolicy: () => void
}

export default function Dashboard({ onCreatePolicy }: DashboardProps) {
  // Sample policy data
  const samplePolicies: Policy[] = [
    {
      id: '1',
      title: 'Remote Work Policy',
      content: 'Comprehensive remote work guidelines...',
      status: 'Compliant',
      dateCreated: new Date('2024-01-15'),
      lastModified: new Date('2024-01-15'),
      policyType: 'Work Arrangement',
      scope: 'All Employees',
    },
    {
      id: '2',
      title: 'Leave Management Policy',
      content: 'Annual leave and time-off policy...',
      status: 'Needs Review',
      dateCreated: new Date('2024-01-10'),
      lastModified: new Date('2024-01-18'),
      policyType: 'Time Off',
      scope: 'All Employees',
    },
    {
      id: '3',
      title: 'Code of Conduct',
      content: 'Professional conduct and ethics...',
      status: 'Compliant',
      dateCreated: new Date('2023-12-20'),
      lastModified: new Date('2023-12-20'),
      policyType: 'Conduct',
      scope: 'All Employees',
    },
    {
      id: '4',
      title: 'Diversity and Inclusion Policy',
      content: 'Equal opportunities and diversity...',
      status: 'Draft',
      dateCreated: new Date('2024-01-20'),
      lastModified: new Date('2024-01-22'),
      policyType: 'Diversity',
      scope: 'All Employees',
    },
    {
      id: '5',
      title: 'Data Protection Policy',
      content: 'Privacy and data security measures...',
      status: 'Compliant',
      dateCreated: new Date('2024-01-05'),
      lastModified: new Date('2024-01-05'),
      policyType: 'Security',
      scope: 'All Employees',
    },
    {
      id: '6',
      title: 'Training and Development Policy',
      content: 'Employee learning and development...',
      status: 'Needs Review',
      dateCreated: new Date('2024-01-08'),
      lastModified: new Date('2024-01-22'),
      policyType: 'Development',
      scope: 'All Employees',
    },
  ]

  // Calculate stats
  const compliantCount = samplePolicies.filter(
    (p) => p.status === 'Compliant'
  ).length
  const complianceRate = Math.round((compliantCount / samplePolicies.length) * 100)
  const pendingReviews = samplePolicies.filter(
    (p) => p.status === 'Needs Review'
  ).length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <FiCheckCircle className="text-green-600" />
      case 'Needs Review':
        return <FiAlertCircle className="text-yellow-600" />
      case 'Draft':
        return <FiEdit3 className="text-gray-600" />
      default:
        return <FiFileText className="text-blue-600" />
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800'
      case 'Needs Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-6 p-6">
        {/* Hero Card */}
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Create New Policy</h2>
              <p className="text-blue-100 mb-4">
                Use AI-powered policy generation to create compliant HR policies
              </p>
              <button
                onClick={onCreatePolicy}
                className="inline-flex items-center gap-2 rounded-lg bg-white text-blue-600 px-6 py-3 font-semibold hover:bg-blue-50 transition-colors shadow-md"
              >
                Start Creating
                <FiArrowRight />
              </button>
            </div>
            <div className="hidden md:block text-blue-200 opacity-50">
              <FiFileText size={120} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FiFileText className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {samplePolicies.length}
                </p>
                <p className="text-sm text-gray-600">Policies Created</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {complianceRate}%
                </p>
                <p className="text-sm text-gray-600">Compliance Rate</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <FiAlertCircle className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingReviews}
                </p>
                <p className="text-sm text-gray-600">Pending Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy History Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiTrendingUp className="text-blue-600" />
              Policy History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Policy Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {samplePolicies.map((policy) => (
                  <tr
                    key={policy.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-gray-400" />
                        <p className="font-medium text-gray-900">
                          {policy.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {policy.policyType}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(
                          policy.status
                        )}`}
                      >
                        {getStatusIcon(policy.status)}
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {policy.dateCreated.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {policy.lastModified.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
