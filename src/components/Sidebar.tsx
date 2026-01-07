'use client'

import React from 'react'
import { FiHome, FiFileText, FiHistory, FiSettings, FiChevronRight } from 'react-icons/fi'

interface SidebarProps {
  currentPage: 'dashboard' | 'create' | 'history'
  onNavigate: (page: 'dashboard' | 'create' | 'history') => void
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiHome,
      description: 'Overview and quick actions',
    },
    {
      id: 'create',
      label: 'Create Policy',
      icon: FiFileText,
      description: 'New policy creation',
    },
    {
      id: 'history',
      label: 'Policy History',
      icon: FiHistory,
      description: 'View past policies',
    },
  ]

  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="sticky top-16 h-[calc(100vh-64px)] flex flex-col overflow-y-auto">
        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === (item.id as any)

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 border-l-4 border-l-blue-600 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon size={20} />
                  <div className="text-left">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                {isActive && <FiChevronRight size={18} />}
              </button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Bottom Section */}
        <div className="space-y-1 px-3 py-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <FiSettings size={20} />
            <div className="text-left flex-1">
              <p className="text-sm font-medium">Settings</p>
              <p className="text-xs text-gray-500">Configuration</p>
            </div>
          </button>
        </div>

        {/* Info Card */}
        <div className="mx-3 mb-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">Powered by AI</p>
          <p className="text-xs text-blue-800">
            Advanced policy generation with compliance checking
          </p>
        </div>
      </div>
    </aside>
  )
}
