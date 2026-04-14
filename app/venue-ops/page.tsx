'use client'

import { useState, useEffect } from 'react'
import { useUserRole } from '@/hooks/useUserRole'
import { UserButton, useClerk } from '@clerk/nextjs'
import { WorkerDashboard } from '@/components/venue-ops/WorkerDashboard'
import { ManagerDashboard } from '@/components/venue-ops/ManagerDashboard'
import { ManagerDashboardV2 } from '@/components/venue-ops/ManagerDashboardV2Enhanced'
import { Button } from '@/components/ui/button'
import { viewStore } from '@/lib/view-store'
import { 
  Menu, 
  X, 
  Building2, 
  Users, 
  LogOut,
  Brain,
  HardHat,
  Sparkles,
  ScanLine
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function VenueOpsPage() {
  const { signOut } = useClerk()
  const { 
    role, 
    roleData, 
    isLoading: roleLoading, 
    user, 
    isUserLoaded,
    canManage 
  } = useUserRole()
  
  // Manager can switch between Operations Center (AI Assistant) view and Field Operations view
  const [viewMode, setViewMode] = useState<'manager' | 'worker'>('manager')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Load saved view preference for managers
  useEffect(() => {
    if (role === 'manager') {
      const savedView = viewStore.get()
      setViewMode(savedView)
    }
  }, [role])
  
  const handleViewChange = (mode: 'manager' | 'worker') => {
    setViewMode(mode)
    viewStore.set(mode)
    setIsSidebarOpen(false) // Close sidebar after selection
  }
  
  // 使用真实的用户数据和角色
  const currentUser = {
    firstName: user?.firstName || user?.username || 'User',
    email: user?.primaryEmailAddress?.emailAddress,
    role: role
  }

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' })
  }

  if (!isUserLoaded || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Menu Button Bar */}
      <div className="fixed top-0 right-0 z-[60] p-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5 text-gray-700" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-gray-50 border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* User Section */}
          <div className="p-6 bg-white border-b">
            <div className="flex items-center gap-4 mb-4">
              <UserButton afterSignOutUrl="/" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {currentUser.firstName}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            
            {/* Role & Venue Info */}
            <div className="space-y-2">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                role === 'manager' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-amber-100 text-amber-700'
              )}>
                {role === 'manager' ? (
                  <>
                    <Users className="h-3.5 w-3.5" />
                    <span>Operations Manager</span>
                  </>
                ) : (
                  <>
                    <HardHat className="h-3.5 w-3.5" />
                    <span>Field Staff</span>
                  </>
                )}
              </div>
              
              {roleData?.venue_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>{roleData.venue_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Manager View Mode Selection */}
          {role === 'manager' && (
            <div className="p-6 bg-white border-b">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Work Mode</p>
                
                {/* Operations Center with AI */}
                <button
                  onClick={() => handleViewChange('manager')}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all text-left",
                    viewMode === 'manager'
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      viewMode === 'manager' ? "bg-blue-100" : "bg-gray-100"
                    )}>
                      <Brain className={cn(
                        "h-5 w-5",
                        viewMode === 'manager' ? "text-blue-600" : "text-gray-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium",
                          viewMode === 'manager' ? "text-blue-900" : "text-gray-900"
                        )}>
                          Operations Center
                        </p>
                        {viewMode === 'manager' && (
                          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-1",
                        viewMode === 'manager' ? "text-blue-700" : "text-gray-500"
                      )}>
                        AI-powered operations management, analytics & task delegation
                      </p>
                    </div>
                  </div>
                </button>

                {/* Field Operations */}
                <button
                  onClick={() => handleViewChange('worker')}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all text-left",
                    viewMode === 'worker'
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      viewMode === 'worker' ? "bg-amber-100" : "bg-gray-100"
                    )}>
                      <ScanLine className={cn(
                        "h-5 w-5",
                        viewMode === 'worker' ? "text-amber-600" : "text-gray-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium",
                          viewMode === 'worker' ? "text-amber-900" : "text-gray-900"
                        )}>
                          Field Operations
                        </p>
                        {viewMode === 'worker' && (
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-1",
                        viewMode === 'worker' ? "text-amber-700" : "text-gray-500"
                      )}>
                        On-site inspections, issue reporting & task management
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 p-6">
            <nav className="space-y-2">
              {/* Additional menu items can be added here */}
            </nav>
          </div>

          {/* Sign Out */}
          <div className="p-6 bg-white border-t">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div>
        {role === 'manager' ? (
          // Manager can switch between views
          viewMode === 'manager' ? (
            <ManagerDashboardV2 user={currentUser} />
          ) : (
            <WorkerDashboard user={currentUser} />
          )
        ) : (
          // Field Staff always sees field operations view
          <WorkerDashboard user={currentUser} />
        )}
      </div>
    </div>
  )
}