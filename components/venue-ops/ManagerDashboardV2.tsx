'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Mic,
  Send,
  AlertTriangle,
  Users,
  Shield,
  ChevronRight,
  CheckCircle2,
  Brain,
  Loader2,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Bot,
  Home,
  Hash,
  ListTodo,
  BarChart3,
  AlertCircle,
  Clock,
  MapPin,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ViewMode = 'main' | 'emergency'
type DataType = 'text' | 'task_list' | 'task_detail' | 'statistics' | 'worker_list' | 'confirmation' | 'emergency'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  data?: any
  data_type?: DataType
  actions?: QuickAction[]
  requires_confirmation?: boolean
  confirmation_context?: any
}

interface QuickAction {
  label: string
  action: string
  payload?: any
  style?: 'primary' | 'secondary' | 'danger'
}

interface CurrentEvent {
  id: string
  type: 'urgent' | 'warning' | 'info'
  title: string
  metric?: string
  trend?: 'up' | 'down' | 'stable'
}

interface ConversationContext {
  id: string
  type: 'main' | 'task'
  title: string
  messages: Message[]
  threadId: string
}

export function ManagerDashboardV2({ user }: { user: any }) {
  const [viewMode, setViewMode] = useState<ViewMode>('main')
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [venueId, setVenueId] = useState<string>('')
  
  // Multiple conversation contexts
  const [contexts, setContexts] = useState<ConversationContext[]>([])
  const [activeContextIndex, setActiveContextIndex] = useState(0)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const activeContext = contexts[activeContextIndex]

  // Live metrics (could be real-time in production)
  const [currentEvents] = useState<CurrentEvent[]>([
    { id: '1', type: 'urgent', title: 'Urgent Tasks', metric: '2', trend: 'up' },
    { id: '2', type: 'warning', title: 'Pending', metric: '5', trend: 'stable' },
    { id: '3', type: 'info', title: 'Completed Today', metric: '8', trend: 'up' }
  ])

  // Get venue ID and initialize main context
  useEffect(() => {
    fetch('/api/venues/current')
      .then(res => res.json())
      .then(data => {
        if (data.venue_id) {
          setVenueId(data.venue_id)
          
          // Initialize main conversation context
          const mainContext: ConversationContext = {
            id: data.venue_id,
            type: 'main',
            title: 'AI Deputy',
            messages: [],
            threadId: `venue:${data.venue_id}`
          }
          setContexts([mainContext])
          
          loadInitialStatus(data.venue_id, mainContext.threadId)
        }
      })
      .catch(err => console.error('Failed to fetch venue:', err))
  }, [])

  const loadInitialStatus = async (venueId: string, threadId: string) => {
    try {
      const response = await fetch(`http://localhost:8001/api/v2/deputy/status/${venueId}`)
      if (!response.ok) throw new Error('Failed to load status')
      
      const data = await response.json()
      
      // Add initial message to the main context
      setContexts(prev => prev.map(ctx => 
        ctx.threadId === threadId 
          ? {
              ...ctx,
              messages: [{
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
                data: data.data,
                data_type: data.data_type,
                actions: data.actions
              }]
            }
          : ctx
      ))
    } catch (error) {
      console.error('Failed to load status:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isThinking || !venueId || !activeContext) return

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date()
    }

    // Update active context's messages
    setContexts(prev => prev.map(ctx => 
      ctx.id === activeContext.id 
        ? { ...ctx, messages: [...ctx.messages, userMessage] }
        : ctx
    ))
    
    setInputText('')
    setIsThinking(true)

    try {
      const response = await fetch('http://localhost:8001/api/v2/deputy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          venue_id: venueId,
          thread_id: activeContext.threadId,  // Use thread_id for conversation isolation
          context: {}
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const data = await response.json()
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        data: data.data,
        data_type: data.data_type,
        actions: data.actions,
        requires_confirmation: data.requires_confirmation,
        confirmation_context: data.confirmation_context
      }

      // Update active context's messages
      setContexts(prev => prev.map(ctx => 
        ctx.id === activeContext.id 
          ? { ...ctx, messages: [...ctx.messages, assistantMessage] }
          : ctx
      ))

      // Handle confirmation dialogs
      if (data.requires_confirmation) {
        // Show confirmation UI (could be a modal in production)
        console.log('Confirmation required:', data.confirmation_context)
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsThinking(false)
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    if (!activeContext) return
    
    // Handle different action types
    if (action.action === 'confirm' || action.action === 'cancel') {
      // Handle confirmation
      const lastMessage = activeContext.messages[activeContext.messages.length - 1]
      if (lastMessage.confirmation_context) {
        const response = await fetch('http://localhost:8001/api/v2/deputy/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: action.action === 'confirm' ? 'Confirmed' : 'Cancelled',
            venue_id: venueId,
            thread_id: activeContext.threadId,
            context: {
              confirmation_action: action.action,
              confirmation_context: lastMessage.confirmation_context
            }
          })
        })
        
        const data = await response.json()
        
        // Update active context's messages
        setContexts(prev => prev.map(ctx => 
          ctx.id === activeContext.id 
            ? { 
                ...ctx, 
                messages: [...ctx.messages, {
                  role: 'assistant',
                  content: data.message,
                  timestamp: new Date(),
                  data: data.data,
                  data_type: data.data_type
                }]
              }
            : ctx
        ))
      }
      return
    }
    
    // Handle task detail opening - create new context
    if (action.action === 'open_task' && action.payload?.task_id) {
      const taskId = action.payload.task_id
      const existingTaskContext = contexts.find(ctx => ctx.id === `task:${taskId}`)
      
      if (!existingTaskContext) {
        // Create new task context with initial context message
        const taskTitle = action.payload.task_type || 'Task'
        const newContext: ConversationContext = {
          id: `task:${taskId}`,
          type: 'task',
          title: `${taskTitle} ${taskId.slice(0, 8)}...`,
          messages: [],
          threadId: `venue:${venueId}:task:${taskId}`
        }
        
        // Add the new context and switch to it
        setContexts(prev => [...prev, newContext])
        setActiveContextIndex(contexts.length) // Switch to new context
        
        // Send initial message to establish task context
        setTimeout(async () => {
          try {
            const response = await fetch('http://localhost:8001/api/v2/deputy/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: `I'm now looking at task ${taskId}. Please show me the details for this task.`,
                venue_id: venueId,
                thread_id: newContext.threadId,
                context: { task_id: taskId }
              })
            })
            
            if (response.ok) {
              const data = await response.json()
              
              // Update the new context with both user message and response
              setContexts(prev => prev.map(ctx => 
                ctx.id === `task:${taskId}`
                  ? {
                      ...ctx,
                      messages: [
                        {
                          role: 'user',
                          content: `I'm now looking at task ${taskId}. Please show me the details for this task.`,
                          timestamp: new Date()
                        },
                        {
                          role: 'assistant',
                          content: data.message,
                          timestamp: new Date(),
                          data: data.data,
                          data_type: data.data_type,
                          actions: data.actions
                        }
                      ]
                    }
                  : ctx
              ))
            }
          } catch (error) {
            console.error('Failed to load task context:', error)
          }
        }, 100)
      } else {
        // Switch to existing task context
        const index = contexts.findIndex(ctx => ctx.id === `task:${taskId}`)
        setActiveContextIndex(index)
      }
      return
    }

    // Send action as a message
    setInputText(action.label)
    setTimeout(() => sendMessage(), 100)
  }

  const handleVoiceInput = () => {
    if (!isRecording) {
      setIsRecording(true)
      // Simulate voice input
      setTimeout(() => {
        setInputText('Show me all urgent tasks')
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

  // Render structured data based on type
  const renderStructuredData = (message: Message) => {
    if (!message.data || message.data_type === 'text') return null

    switch (message.data_type) {
      case 'task_list':
        return (
          <div className="mt-3 space-y-2">
            {message.data.tasks?.map((task: any) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={task.priority >= 4 ? 'destructive' : task.priority >= 3 ? 'default' : 'secondary'}>
                          Priority {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.type}</Badge>
                      </div>
                      <p className="font-medium text-sm">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {task.location?.area || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ~{task.estimated_time} min
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setInputText(`Show details for task ${task.id}`)
                        sendMessage()
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'statistics':
        return (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Pending</span>
                    <span className="font-bold">{message.data.tasks?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active</span>
                    <span className="font-bold">{message.data.tasks?.active || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Urgent</span>
                    <span className="font-bold text-red-600">{message.data.tasks?.urgent || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Available</span>
                    <span className="font-bold text-green-600">{message.data.workers?.available || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Busy</span>
                    <span className="font-bold">{message.data.workers?.busy || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Avg Time</span>
                    <span className="font-bold">{message.data.performance?.avg_resolution_time || 'N/A'} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-bold">{message.data.performance?.completion_rate || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'task_detail':
        return (
          <Card className="mt-3">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Task Details</h4>
                  <p className="text-sm">{message.data.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <Badge className="ml-2" variant={message.data.priority >= 4 ? 'destructive' : 'default'}>
                      {message.data.priority}/5
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium">{message.data.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{message.data.location?.area}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Est. Time:</span>
                    <span className="ml-2 font-medium">{message.data.ai_analysis?.estimated_minutes} min</span>
                  </div>
                </div>

                {message.data.available_workers && message.data.available_workers.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Available Workers</h5>
                    <div className="space-y-1">
                      {message.data.available_workers.map((worker: any) => (
                        <div key={worker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{worker.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setInputText(`Assign task to ${worker.name}`)
                              sendMessage()
                            }}
                          >
                            Assign
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'confirmation':
        return (
          <Card className="mt-3 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Confirmation Required</p>
                  <p className="text-sm mt-1">{message.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

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
        <div className="p-4">
          <Card className="border-red-300">
            <CardContent className="p-4">
              <p>Emergency handling interface...</p>
            </CardContent>
          </Card>
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
              <h1 className="text-sm font-semibold text-slate-900">AI Deputy</h1>
              <p className="text-xs text-slate-500">{user?.firstName || 'Manager'}</p>
            </div>
          </div>
          <div className="w-12" />
        </div>
      </div>

      {/* Context Tabs - Show when multiple contexts exist */}
      {contexts.length > 1 && (
        <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto">
          {contexts.map((ctx, index) => (
            <button
              key={ctx.id}
              onClick={() => setActiveContextIndex(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeContextIndex === index
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {ctx.type === 'main' ? (
                <Home className="h-3 w-3" />
              ) : (
                <Hash className="h-3 w-3" />
              )}
              <span>{ctx.title}</span>
              {ctx.type === 'task' && index !== 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Remove context
                    setContexts(prev => prev.filter((_, i) => i !== index))
                    if (activeContextIndex >= index && activeContextIndex > 0) {
                      setActiveContextIndex(prev => prev - 1)
                    }
                  }}
                  className="ml-1 p-0.5 hover:bg-orange-200 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Live Metrics Bar */}
      <div className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="flex items-center gap-6 overflow-x-auto text-xs">
          {currentEvents.map(event => (
            <div key={event.id} className="flex items-center gap-2 flex-shrink-0">
              {event.type === 'urgent' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              {event.type === 'warning' && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
              {event.type === 'info' && <div className="w-2 h-2 bg-white rounded-full" />}
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

      {/* Chat Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {activeContext?.messages.map((message, index) => (
            <div key={index} className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-orange-600" />
                </div>
              )}
              
              <div className={cn('max-w-[80%] space-y-2', message.role === 'user' ? 'items-end' : 'items-start')}>
                {/* Only show text bubble if no structured data or if it's text type */}
                {(message.role === 'user' || !message.data_type || message.data_type === 'text') && (
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
                )}
                
                {/* Render structured data */}
                {renderStructuredData(message)}
                
                {/* Quick actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.actions.map((action, actionIndex) => (
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
                          action.style === 'primary' && "bg-orange-600 hover:bg-orange-700"
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
                  <User className="h-4 w-4 text-gray-600" />
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
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about tasks, assign work, or get insights..."
              className="w-full px-4 py-2.5 pr-10 bg-slate-50 rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              disabled={isThinking}
            />
            <button
              onClick={sendMessage}
              disabled={isThinking || !inputText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <button
            onClick={handleVoiceInput}
            disabled={isThinking}
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