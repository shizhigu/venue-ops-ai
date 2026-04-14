'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Mic,
  Send,
  AlertTriangle,
  Users,
  Sparkles,
  Shield,
  ChevronRight,
  CheckCircle2,
  Zap,
  Brain,
  Loader2,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
  AlertCircle,
  X,
  Bot,
  Home,
  Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

type ViewMode = 'main' | 'details' | 'people' | 'emergency'
type ConversationType = 'main' | 'task'

interface CurrentEvent {
  id: string
  type: 'urgent' | 'warning' | 'info'
  title: string
  description?: string
  metric?: string
  trend?: 'up' | 'down' | 'stable'
}

interface AIMessage {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
  actions?: { label: string; primary?: boolean; action: () => void }[]
}

interface StaffMember {
  id: string
  name: string
  role: string
  status: 'available' | 'busy' | 'break'
  currentTask?: string
  location?: string
}

interface QuickAction {
  label: string
  action: string
  payload?: any
  style?: 'primary' | 'secondary' | 'danger'
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  quickActions?: QuickAction[]
}

interface ConversationContext {
  type: ConversationType
  id: string
  title: string
  messages: Message[]
}

export function ManagerDashboard({ user }: { user: any }) {
  const [viewMode, setViewMode] = useState<ViewMode>('main')
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [venueId, setVenueId] = useState<string>('')
  
  // AI Deputy state
  const [contexts, setContexts] = useState<ConversationContext[]>([
    {
      type: 'main',
      id: '',
      title: 'AI Deputy',
      messages: []
    }
  ])
  const [activeContextIndex, setActiveContextIndex] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const activeContext = contexts[activeContextIndex]

  // Live metrics
  const [currentEvents] = useState<CurrentEvent[]>([
    {
      id: '1',
      type: 'urgent',
      title: 'Zone B Water Leak',
      description: 'Tech Li responding',
      metric: '15 min',
      trend: 'down'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Power Load',
      metric: '78%',
      trend: 'up'
    },
    {
      id: '3',
      type: 'info',
      title: 'Staff Active',
      metric: '18/20',
      trend: 'stable'
    }
  ])

  // Staff data
  const [staff] = useState<StaffMember[]>([
    { id: '1', name: 'Tech Li', role: 'Maintenance', status: 'busy', currentTask: 'Zone B repair', location: 'Zone B' },
    { id: '2', name: 'Tech Wang', role: 'Electrician', status: 'available', location: 'Standby' },
    { id: '3', name: 'Ms. Chen', role: 'Cleaning', status: 'busy', currentTask: 'East zone', location: 'East' },
    { id: '4', name: 'Mr. Zhang', role: 'Security', status: 'available', location: 'West Gate' }
  ])

  // Get venue ID
  useEffect(() => {
    fetch('/api/venues/current')
      .then(res => res.json())
      .then(data => {
        if (data.venue_id) {
          setVenueId(data.venue_id)
          setContexts(prev => {
            const newContexts = [...prev]
            newContexts[0].id = data.venue_id
            return newContexts
          })
        }
      })
      .catch(err => console.error('Failed to fetch venue:', err))
  }, [])

  // Load initial overview
  useEffect(() => {
    if (venueId) {
      loadInitialOverview()
    }
  }, [venueId])

  const loadInitialOverview = async () => {
    try {
      const response = await fetch(`http://localhost:8001/api/deputy/overview/${venueId}`)
      if (!response.ok) throw new Error('Failed to load overview')
      
      const data = await response.json()
      
      // Add initial message to main context
      setContexts(prev => {
        const newContexts = [...prev]
        newContexts[0].messages = [{
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          quickActions: data.quick_actions
        }]
        return newContexts
      })
    } catch (error) {
      console.error('Failed to load overview:', error)
    }
  }

  const openTaskContext = async (taskId: string) => {
    // Check if already open
    const existingIndex = contexts.findIndex(c => c.type === 'task' && c.id === taskId)
    if (existingIndex !== -1) {
      setActiveContextIndex(existingIndex)
      return
    }

    try {
      const response = await fetch(`http://localhost:8001/api/deputy/task/${taskId}/context`)
      if (!response.ok) throw new Error('Failed to load task context')
      
      const data = await response.json()
      
      // Create new task context
      const newContext: ConversationContext = {
        type: 'task',
        id: taskId,
        title: `Task #${taskId.substring(0, 8)}`,
        messages: [{
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          quickActions: data.quick_actions
        }]
      }
      
      setContexts(prev => [...prev, newContext])
      setActiveContextIndex(contexts.length)
    } catch (error) {
      console.error('Failed to load task context:', error)
      toast.error('Failed to open task')
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isThinking) return

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date()
    }

    // Add user message to current context
    setContexts(prev => {
      const newContexts = [...prev]
      newContexts[activeContextIndex].messages.push(userMessage)
      return newContexts
    })

    setInputText('')
    setIsThinking(true)

    try {
      const response = await fetch('http://localhost:8001/api/deputy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          context_type: activeContext.type,
          context_id: activeContext.id
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const data = await response.json()
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        quickActions: data.quick_actions
      }

      setContexts(prev => {
        const newContexts = [...prev]
        newContexts[activeContextIndex].messages.push(assistantMessage)
        return newContexts
      })

      // Handle context switch if needed
      if (data.context_switch) {
        const { type, id } = data.context_switch
        if (type === 'task') {
          openTaskContext(id)
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsThinking(false)
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    // Special handling for certain actions
    if (action.action === 'open_task' && action.payload?.task_id) {
      openTaskContext(action.payload.task_id)
      return
    }

    // Send as message
    const message = action.label
    setInputText(message)
    await sendMessage()
  }

  const closeContext = (index: number) => {
    if (index === 0) return // Can't close main context
    
    setContexts(prev => prev.filter((_, i) => i !== index))
    if (activeContextIndex >= index && activeContextIndex > 0) {
      setActiveContextIndex(activeContextIndex - 1)
    }
  }

  const handleVoiceInput = () => {
    if (!isRecording) {
      setIsRecording(true)
      setTimeout(() => {
        setInputText('What is the current status?')
        setIsRecording(false)
      }, 2000)
    } else {
      setIsRecording(false)
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [activeContext?.messages])

  // Emergency Mode
  if (viewMode === 'emergency') {
    return (
      <div className="h-screen bg-red-50">
        <div className="p-4 bg-red-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <h1 className="text-lg font-bold">Emergency Mode</h1>
            </div>
            <button onClick={() => setViewMode('main')} className="p-2 hover:bg-red-700 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-red-300">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="font-bold text-slate-900">Fire Alarm - Zone C Level 3</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">Triggered 2 minutes ago</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Fire department notified</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Evacuation started</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>All staff alerted</span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                Shut Down Power
              </button>
              <button className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
                Cancel Event
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Staff View
  if (viewMode === 'people') {
    const available = staff.filter(s => s.status === 'available')
    const busy = staff.filter(s => s.status === 'busy')

    return (
      <div className="h-screen bg-slate-50">
        <div className="px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <button onClick={() => setViewMode('main')} className="p-2 hover:bg-slate-100 rounded-lg">
              <ChevronRight className="h-5 w-5 text-slate-600 rotate-180" />
            </button>
            <h1 className="font-semibold text-slate-900">Staff Management</h1>
            <div className="w-9" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Total Staff</span>
              <span className="font-semibold">{staff.length} Online</span>
            </div>
          </div>

          {available.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Available ({available.length})
              </h3>
              <div className="space-y-2">
                {available.map(person => (
                  <div key={person.id} className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{person.name}</p>
                        <p className="text-xs text-slate-500">{person.role} • {person.location}</p>
                      </div>
                      <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {busy.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Working ({busy.length})
              </h3>
              <div className="space-y-2">
                {busy.map(person => (
                  <div key={person.id} className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{person.name}</p>
                        <p className="text-xs text-slate-500">
                          {person.role} • {person.currentTask}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">{person.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main AI Interface
  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">{user?.firstName || 'Manager'}</h1>
              <p className="text-xs text-slate-500">National Stadium</p>
            </div>
          </div>
          {/* Spacer for menu button */}
          <div className="w-12" />
        </div>
      </div>

      {/* Live Metrics Bar */}
      <div className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="flex items-center gap-6 overflow-x-auto text-xs">
          {currentEvents.map(event => (
            <div key={event.id} className="flex items-center gap-2 flex-shrink-0">
              {event.type === 'urgent' && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
              {event.type === 'warning' && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              )}
              {event.type === 'info' && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
              <span className="font-medium">{event.title}</span>
              {event.metric && (
                <span className="text-orange-200 flex items-center gap-1">
                  {event.metric}
                  {event.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-400" />}
                  {event.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-400" />}
                  {event.trend === 'stable' && <Minus className="h-3 w-3 text-orange-300" />}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Context Tabs */}
      {contexts.length > 1 && (
        <div className="flex items-center gap-1 p-2 border-b bg-white overflow-x-auto">
          {contexts.map((context, index) => (
            <button
              key={`${context.type}-${context.id}`}
              onClick={() => setActiveContextIndex(index)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-gray-100',
                activeContextIndex === index ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              )}
            >
              {context.type === 'main' ? (
                <Home className="h-3.5 w-3.5" />
              ) : (
                <Hash className="h-3.5 w-3.5" />
              )}
              <span>{context.title}</span>
              {index > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeContext(index)
                  }}
                  className="ml-1 hover:bg-gray-200 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
        </div>
      )}

      {/* AI Chat Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {activeContext?.messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-orange-600" />
                </div>
              )}
              
              <div className={cn(
                'max-w-[70%] space-y-2',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <div
                  className={cn(
                    'rounded-lg px-4 py-2',
                    message.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                
                {message.quickActions && message.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.quickActions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        size="sm"
                        variant={
                          action.style === 'danger' ? 'destructive' :
                          action.style === 'secondary' ? 'outline' :
                          'default'
                        }
                        onClick={() => handleQuickAction(action)}
                        className={cn(
                          "text-xs",
                          action.style === 'primary' && "bg-orange-600 hover:bg-orange-700",
                          action.style === 'danger' && "bg-red-600 hover:bg-red-700"
                        )}
                      >
                        {action.label}
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isThinking && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-orange-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setViewMode('details')}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200"
          >
            <Eye className="inline h-3 w-3 mr-1" />
            Details
          </button>
          <button
            onClick={() => setViewMode('people')}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200"
          >
            <Users className="inline h-3 w-3 mr-1" />
            Staff
          </button>
          <button
            onClick={() => setViewMode('emergency')}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
          >
            <AlertTriangle className="inline h-3 w-3 mr-1" />
            Emergency
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask AI Deputy or give commands..."
              className="w-full px-4 py-2.5 pr-10 bg-slate-50 rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={sendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded transition-colors"
            >
              <Send className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <button
            onClick={handleVoiceInput}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              isRecording 
                ? "bg-red-600 text-white" 
                : "bg-orange-600 text-white hover:bg-orange-700"
            )}
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}