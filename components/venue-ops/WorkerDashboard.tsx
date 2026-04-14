'use client'

import { useState, useEffect } from 'react'
import { 
  Camera,
  Mic,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Navigation,
  X,
  HelpCircle,
  ChevronRight,
  Zap,
  Loader2,
  Clock,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { IssueReporter } from './IssueReporter'

type ViewMode = 'main' | 'task-detail'

interface Task {
  id: string
  title: string
  location: string
  priority: 'urgent' | 'normal' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  estimatedTime?: string
  description?: string
  assignedBy?: string
}

export function WorkerDashboard({ user }: { user: any }) {
  const [viewMode, setViewMode] = useState<ViewMode>('main')
  const [isRecording, setIsRecording] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [reportingStep, setReportingStep] = useState<'capture' | 'processing' | 'done'>('capture')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [completedToday] = useState(12)
  const [isReporterOpen, setIsReporterOpen] = useState(false)
  
  const [pendingTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Water leak in Zone B',
      location: 'Zone B Level 3',
      priority: 'urgent',
      status: 'pending',
      estimatedTime: '15 min',
      description: 'Pipe leak near restroom',
      assignedBy: 'AI System'
    },
    {
      id: '2',
      title: 'Replace conference room lights',
      location: 'Room 201',
      priority: 'normal',
      status: 'pending',
      estimatedTime: '30 min',
      description: '3 bulbs need replacement',
      assignedBy: 'Manager Wang'
    }
  ])

  // Timer for active task
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTask) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTask])

  const handleStartTask = (task: Task) => {
    setActiveTask(task)
    setElapsedTime(0)
    setViewMode('task-detail')
  }

  const handleCompleteTask = () => {
    setActiveTask(null)
    setElapsedTime(0)
    setViewMode('main')
  }

  const handleReport = async () => {
    setReportingStep('processing')
    setTimeout(() => {
      setReportingStep('done')
      setTimeout(() => {
        setViewMode('main')
        setReportingStep('capture')
      }, 2000)
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Main Screen
  if (viewMode === 'main') {
    const urgentCount = pendingTasks.filter(t => t.priority === 'urgent').length
    
    return (
      <div className="h-screen bg-slate-50">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-900">{user?.firstName || 'John Smith'}</h1>
                <p className="text-xs text-slate-500">Maintenance Team • ID: 1247</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xl font-bold text-orange-600">{completedToday}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
              {/* Spacer for menu button */}
              <div className="w-12" />
            </div>
          </div>
        </div>

        {/* Alert Bar */}
        {urgentCount > 0 && (
          <div className="mx-4 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                {urgentCount} Urgent Task{urgentCount > 1 ? 's' : ''} Waiting
              </span>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 px-4 py-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-orange-600 uppercase tracking-wider px-1">
              ASSIGNED TASKS
            </h2>
            {pendingTasks.map(task => (
              <button
                key={task.id}
                onClick={() => handleStartTask(task)}
                className={cn(
                  "w-full p-4 bg-white border rounded-lg text-left hover:shadow-sm transition-all",
                  task.priority === 'urgent' 
                    ? "border-orange-300 bg-orange-50/50"
                    : "border-slate-200"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {task.priority === 'urgent' && (
                      <span className="inline-block px-2 py-0.5 bg-orange-600 text-white text-xs font-bold rounded mb-2">
                        URGENT
                      </span>
                    )}
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.location}
                      </span>
                      <span>•</span>
                      <span>{task.estimatedTime}</span>
                      <span>•</span>
                      <span>{task.assignedBy}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-orange-400 mt-1" />
                </div>
              </button>
            ))}
          </div>

          {/* Status Card */}
          <div className="mt-auto">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-900">Available</span>
                </div>
                <span className="text-xs text-green-700">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 bg-white border-t border-slate-200">
          <button className="w-full py-3 bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition-colors border border-orange-200">
            <HelpCircle className="inline h-4 w-4 mr-2" />
            Need Help
          </button>
        </div>
        
        {/* Floating Action Button for Quick Report */}
        <button
          onClick={() => setIsReporterOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-orange-600 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-700 active:scale-95 transition-all z-30"
        >
          <div className="relative">
            <Camera className="h-7 w-7 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
        </button>
        
        {/* Issue Reporter Modal */}
        <IssueReporter
          isOpen={isReporterOpen}
          onClose={() => setIsReporterOpen(false)}
          onSubmit={async (data) => {
            try {
              const response = await fetch('/api/tasks/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
              })
              
              if (!response.ok) {
                throw new Error('Failed to submit')
              }
              
              const result = await response.json()
              console.log('Task created successfully:', result)
              
              // Refresh task list
              // Add refresh logic here
            } catch (error) {
              console.error('Failed to submit:', error)
              throw error
            }
          }}
          currentLocation={{
            area: 'Zone B',
            floor: 'Level 3',
            coordinates: [39.9, 116.4]
          }}
        />
      </div>
    )
  }


  // Task Execution Screen
  if (viewMode === 'task-detail' && activeTask) {
    return (
      <div className="h-screen bg-slate-50">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-slate-900">Active Task</h1>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="font-mono text-lg font-semibold text-slate-900">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Task Info */}
        <div className="flex-1 p-4 space-y-4">
          {activeTask.priority === 'urgent' && (
            <div className="inline-block px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">
              URGENT PRIORITY
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">{activeTask.title}</h2>
            <p className="text-sm text-slate-600">{activeTask.description}</p>
          </div>

          {/* Location */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">{activeTask.location}</p>
                  <p className="text-xs text-slate-500">Tap to navigate</p>
                </div>
              </div>
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Navigation className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progress</span>
              <span>{activeTask.estimatedTime}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((elapsedTime / 900) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <button
            onClick={handleCompleteTask}
            className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            <CheckCircle2 className="inline h-5 w-5 mr-2" />
            Mark Complete
          </button>
          
          <button className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
            <HelpCircle className="inline h-4 w-4 mr-2" />
            Request Help
          </button>
        </div>
      </div>
    )
  }

  return null
}