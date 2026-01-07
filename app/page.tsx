/**
 * MAIN PAGE - Build your UI here!
 *
 * FILE STRUCTURE (DO NOT CHANGE):
 * - app/page.tsx       ← YOU ARE HERE - main page
 * - app/layout.tsx     ← root layout (pre-configured)
 * - app/error.tsx      ← error boundary (pre-configured)
 * - app/not-found.tsx  ← 404 page (pre-configured)
 * - app/loading.tsx    ← loading state (pre-configured)
 * - app/api/           ← API routes
 * - src/components/ui/ ← shadcn/ui components
 * - src/lib/utils.ts   ← cn() helper
 *
 * ⚠️ NEVER create src/app/ - files go in app/ directly!
 * ⚠️ NEVER create error.tsx, not-found.tsx - use the ones here!
 * ⚠️ NEVER import from 'next/document' - App Router doesn't use it!
 */

'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import PolicyCreationWorkspace from '@/components/PolicyCreationWorkspace'

type PageType = 'dashboard' | 'create' | 'history'

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
  }

  const handleCreatePolicy = () => {
    setCurrentPage('create')
  }

  const handleBack = () => {
    setCurrentPage('dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

        {/* Page Content */}
        {currentPage === 'dashboard' && (
          <Dashboard onCreatePolicy={handleCreatePolicy} />
        )}

        {currentPage === 'create' && (
          <PolicyCreationWorkspace onBack={handleBack} />
        )}

        {currentPage === 'history' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                Policy history coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
