'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Bot, User, Home, Hash, X, Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

type ConversationType = 'main' | 'task'

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

interface AIDeputyProps {
  venueId: string
  initialTaskId?: string
  className?: string
}

export function AIDeputy({ venueId, initialTaskId, className }: AIDeputyProps) {
  const [contexts, setContexts] = useState<ConversationContext[]>([
    {
      type: 'main',
      id: venueId,
      title: 'AI Deputy',
      messages: []
    }
  ])
  const [activeContextIndex, setActiveContextIndex] = useState(0)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeContext = contexts[activeContextIndex]

  // Load initial overview
  useEffect(() => {
    loadInitialOverview()
  }, [venueId])

  // Open task context if provided
  useEffect(() => {
    if (initialTaskId) {
      openTaskContext(initialTaskId)
    }
  }, [initialTaskId])

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
      toast.error('Failed to connect to AI Deputy')
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
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    // Add user message to current context
    setContexts(prev => {
      const newContexts = [...prev]
      newContexts[activeContextIndex].messages.push(userMessage)
      return newContexts
    })

    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8001/api/deputy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
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
      setIsLoading(false)
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
    setInput(message)
    await sendMessage()
  }

  const closeContext = (index: number) => {
    if (index === 0) return // Can't close main context
    
    setContexts(prev => prev.filter((_, i) => i !== index))
    if (activeContextIndex >= index && activeContextIndex > 0) {
      setActiveContextIndex(activeContextIndex - 1)
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [activeContext?.messages])

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Context Tabs */}
      <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
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

      {/* Messages */}
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
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
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
                        className="text-xs"
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
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask AI Deputy or give commands..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}