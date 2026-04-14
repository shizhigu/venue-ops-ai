'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useUserRole } from '@/hooks/useUserRole'
import { 
  AlertCircle, Bot, Building2, CheckCircle, Clock, FileText, 
  Hash, Heart, Home, MapPin, MessageSquare, Minus, Send, 
  TrendingDown, TrendingUp, User, Users, X, Camera, 
  Wrench, Shield, Zap, ArrowRight, Sparkles
} from 'lucide-react'

type ViewMode = 'main' | 'emergency'
type DataType = 'text' | 'task_list' | 'task_detail' | 'statistics' | 'worker_list' | 'confirmation' | 'emergency'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  data?: any
  data_type?: DataType
  actions?: any[]
  requires_confirmation?: boolean
  confirmation_context?: any
}

interface ConversationContext {
  id: string
  title: string
  type: 'main' | 'task'
  messages: Message[]
  threadId: string
  taskId?: string
}

interface EventInfo {
  id: string
  type: 'urgent' | 'warning' | 'info'
  title: string
  metric?: string
  trend?: 'up' | 'down' | 'stable'
}

interface ManagerDashboardV2Props {
  user?: {
    firstName?: string
    role?: string
  }
}

export const ManagerDashboardV2: React.FC<ManagerDashboardV2Props> = ({ user }) => {
  const { roleData } = useUserRole()
  const venueId = roleData?.venue_id || '00000000-0000-0000-0000-000000000001'
  
  const [viewMode, setViewMode] = useState<ViewMode>('main')
  const [currentEvents, setCurrentEvents] = useState<EventInfo[]>([])
  const [contexts, setContexts] = useState<ConversationContext[]>([
    {
      id: 'main',
      title: 'Main Dashboard',
      type: 'main',
      messages: [],
      threadId: `venue:${venueId}`
    }
  ])
  const [activeContextIndex, setActiveContextIndex] = useState(0)
  const [localInputs, setLocalInputs] = useState<Record<string, string>>({})
  const [input, setInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const activeContext = contexts[activeContextIndex]
  
  // Single useChat hook for the active context
  const { messages, sendMessage, status, error } = useChat({
    api: '/api/chat',
    id: activeContext.threadId,
    // streamProtocol: 'data' is the default
    onResponse: (response) => {
      console.log('Response received:', response);
    },
    onFinish: (message) => {
      console.log('Message finished:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(
        { text: input },
        { 
          body: { 
            venueId,
            contextId: activeContext.id 
          } 
        }
      )
      setInput('')
    }
  }

  // Sync messages to active context
  useEffect(() => {
    console.log('Messages updated:', messages);
    if (messages.length > 0 && activeContext) {
      setContexts(prev => prev.map(ctx => 
        ctx.id === activeContext.id 
          ? { 
              ...ctx, 
              messages: messages.map(msg => {
                // Extract text and tool results from parts
                console.log('Message parts:', msg.parts);
                
                const textParts = msg.parts.filter(p => p.type === 'text')
                const toolParts = msg.parts.filter(p => p.type === 'tool-result')
                
                const content = textParts.map(p => (p as any).text).join('')
                console.log('Extracted content:', content);
                console.log('Tool parts:', toolParts);
                
                // Extract data from tool results
                let data = null;
                let data_type = 'text';
                
                if (toolParts.length > 0) {
                  const toolResult = (toolParts[0] as any).result;
                  console.log('Tool result:', toolResult);
                  if (toolResult && toolResult.data_type) {
                    data = toolResult.data;
                    data_type = toolResult.data_type;
                  }
                }
                
                return {
                  role: msg.role as 'user' | 'assistant',
                  content,
                  timestamp: new Date(),
                  data,
                  data_type
                }
              })
            }
          : ctx
      ))
    }
  }, [messages, activeContext?.id])

  // Save/restore input when switching contexts
  useEffect(() => {
    // Save current input
    if (activeContext) {
      setLocalInputs(prev => ({ ...prev, [activeContext.id]: input }))
    }
  }, [input, activeContext?.id])

  useEffect(() => {
    // Restore input for new context
    if (activeContext && localInputs[activeContext.id] !== undefined) {
      setInput(localInputs[activeContext.id])
    } else {
      setInput('')
    }
  }, [activeContextIndex])

  // Helper functions to parse tool results
  const tryParseToolResult = (content: string) => {
    try {
      // Check if content looks like JSON
      if (content.includes('"data_type"') && content.includes('{')) {
        const match = content.match(/\{[\s\S]*\}/)
        if (match) {
          const parsed = JSON.parse(match[0])
          return parsed.data || parsed
        }
      }
    } catch (e) {
      // Not JSON, return null
    }
    return null
  }

  const detectDataType = (content: string): DataType => {
    if (content.includes('"data_type":"task_list"')) return 'task_list'
    if (content.includes('"data_type":"task_detail"')) return 'task_detail'
    if (content.includes('"data_type":"statistics"')) return 'statistics'
    return 'text'
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [activeContext?.messages])

  // Remove simulated events - we'll use real data
  useEffect(() => {
    // We can fetch real venue statistics here if needed
    setCurrentEvents([])
  }, [])

  const addTaskContext = (taskId: string, taskDescription: string) => {
    const existingContext = contexts.find(c => c.taskId === taskId)
    if (existingContext) {
      setActiveContextIndex(contexts.indexOf(existingContext))
      return
    }

    const newContext: ConversationContext = {
      id: `task-${taskId}`,
      title: taskDescription.substring(0, 30) + '...',
      type: 'task',
      messages: [],
      threadId: `venue:${venueId}:task:${taskId}`,
      taskId
    }
    
    setContexts(prev => [...prev, newContext])
    setActiveContextIndex(contexts.length)
  }

  const handleQuickAction = (action: any) => {
    if (action.action === 'open_task' && action.payload?.task_id) {
      addTaskContext(
        action.payload.task_id,
        action.payload.task_type || 'Task'
      )
    } else if (action.action === 'filter_urgent') {
      sendMessage(
        { text: 'Show urgent tasks with priority 4 or higher' },
        { 
          body: { 
            venueId,
            contextId: activeContext.id 
          } 
        }
      )
    }
  }

  const sendQuickMessage = (message: string) => {
    sendMessage(
      { text: message },
      { 
        body: { 
          venueId,
          contextId: activeContext.id 
        } 
      }
    )
  }

  // Render structured data based on type
  const renderStructuredData = (message: Message) => {
    console.log('renderStructuredData called with:', message.data_type, message.data);
    
    if (!message.data || message.data_type === 'text') return null

    switch (message.data_type) {
      case 'task_list':
        const tasks = message.data.tasks || [];
        const totalCount = message.data.total_count || 0;
        
        console.log('Rendering tasks:', tasks);
        
        if (tasks.length === 0) {
          return (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-gray-600">
              No pending tasks found
            </div>
          );
        }
        
        return (
          <div className="mt-3 space-y-2">
            <div className="text-sm text-gray-600 mb-2">
              Found {totalCount} pending task{totalCount !== 1 ? 's' : ''}
            </div>
            {tasks.map((task: any) => (
              <Card 
                key={task.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addTaskContext(task.id, task.description)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={task.priority >= 4 ? 'destructive' : 'default'}>
                          P{task.priority}
                        </Badge>
                        <span className="text-sm font-medium">{task.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {task.location?.area || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_time || 30} min
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'task_detail':
        return (
          <Card className="mt-3">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">{message.data.type || 'Task'}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{message.data.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Priority:</span>
                    <Badge className="ml-2" variant={message.data.priority >= 4 ? 'destructive' : 'default'}>
                      P{message.data.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="ml-2" variant="outline">
                      {message.data.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="ml-2">{message.data.location?.area || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="ml-2">{message.data.ai_analysis?.estimated_minutes || 30} min</span>
                  </div>
                </div>

                {message.data.available_workers && message.data.available_workers.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Available Workers:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.data.available_workers.map((worker: any) => (
                        <Badge key={worker.id} variant="secondary">
                          <User className="h-3 w-3 mr-1" />
                          {worker.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'statistics':
        return (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="font-semibold">{message.data.tasks?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active</span>
                    <span className="font-semibold">{message.data.tasks?.active || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgent</span>
                    <span className="font-semibold text-destructive">{message.data.tasks?.urgent || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Available</span>
                    <span className="font-semibold text-green-600">{message.data.workers?.available || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Busy</span>
                    <span className="font-semibold text-orange-600">{message.data.workers?.busy || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-semibold">{message.data.workers?.total || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  AI Deputy
                </h1>
                <p className="text-sm text-slate-600">Intelligent Operations Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-2 py-1.5 px-3">
                <Building2 className="h-3.5 w-3.5" />
                {roleData?.venue_name || 'Loading...'}
              </Badge>
              <Badge variant={viewMode === 'emergency' ? 'destructive' : 'secondary'} className="gap-2 py-1.5 px-3">
                {viewMode === 'emergency' ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                    Emergency Mode
                  </>
                ) : (
                  <>
                    <Shield className="h-3.5 w-3.5" />
                    Normal Operations
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Context Tabs */}
      {contexts.length > 1 && (
        <div className="px-6 py-2 bg-white/80 backdrop-blur-sm border-b flex gap-2 overflow-x-auto">
          {contexts.map((ctx, index) => (
            <button
              key={ctx.id}
              onClick={() => setActiveContextIndex(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Error: {error.message || 'Something went wrong'}
            </div>
          )}
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
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-orange-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
                  <span className="text-sm text-slate-600">AI Deputy is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white/95 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about venue operations..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input?.trim()}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage('Show pending tasks')}
            className="text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending Tasks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage('Show venue statistics')}
            className="text-xs"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Statistics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage('Show urgent tasks')}
            className="text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            Urgent
          </Button>
        </div>
      </div>
    </div>
  )
}