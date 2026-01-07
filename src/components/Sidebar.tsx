'use client'

import React from 'react'
import { FiHome, FiFileText, FiHistory, FiSettings, FiChevronRight } from 'react-icons/fi'

interface SidebarProps {
  currentPage: 'dashboard' | 'create' | 'history'
  onNavigate: (page: 'dashboard' | 'create' | 'history') => void
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="sticky top-16 h-[calc(100vh-64px)] flex flex-col overflow-y-auto">
        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {/* Dashboard Item */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'dashboard'
                ? 'bg-blue-50 border-l-4 border-l-blue-600 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <FiHome size={20} />
              <div className="text-left">
                <p className="text-sm font-medium">Dashboard</p>
                <p className="text-xs text-gray-500">Overview and quick actions</p>
              </div>
            </div>
            {currentPage === 'dashboard' && <FiChevronRight size={18} />}
          </button>

          {/* Create Policy Item */}
          <button
            onClick={() => onNavigate('create')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'create'
                ? 'bg-blue-50 border-l-4 border-l-blue-600 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <FiFileText size={20} />
              <div className="text-left">
                <p className="text-sm font-medium">Create Policy</p>
                <p className="text-xs text-gray-500">New policy creation</p>
              </div>
            </div>
            {currentPage === 'create' && <FiChevronRight size={18} />}
          </button>

          {/* History Item */}
          <button
            onClick={() => onNavigate('history')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === 'history'
                ? 'bg-blue-50 border-l-4 border-l-blue-600 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <FiHistory size={20} />
              <div className="text-left">
                <p className="text-sm font-medium">Policy History</p>
                <p className="text-xs text-gray-500">View past policies</p>
              </div>
            </div>
            {currentPage === 'history' && <FiChevronRight size={18} />}
          </button>
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
