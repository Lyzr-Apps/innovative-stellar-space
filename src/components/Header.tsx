'use client'

import React from 'react'
import { FiUser, FiSettings } from 'react-icons/fi'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">HR</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              HR Policy Manager
            </h1>
            <p className="text-xs text-gray-500">Enterprise Policy Management</p>
          </div>
        </div>

        {/* Right: User Profile */}
        <div className="flex items-center gap-4">
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Settings"
          >
            <FiSettings size={20} />
          </button>

          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-shadow">
            <FiUser size={16} />
          </div>
        </div>
      </div>
    </header>
  )
}
