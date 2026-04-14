'use client'

import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, User, Send, AlertCircle, CheckCircle, Clock, Users, X, Hash, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

interface AIDeputyProps {
  venueId: string
  initialTaskId?: string
}

interface Context {
  id: string
  title: string
  type: 'main' | 'task'
  taskId?: string
}

export default function AIDeputySimple({ venueId, initialTaskId }: AIDeputyProps) {
  const [contexts, setContexts] = useState<Context[]>([
    { id: 'main', title: 'Main Dashboard', type: 'main' }
  ])
  const [activeContextId, setActiveContextId] = useState('main')
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Initialize chat for the active context
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      venueId,
      contextId: activeContextId,
    },
    id: activeContextId, // This creates separate chat instances per context
    initialMessages: activeContextId === 'main' 
      ? [{ id: '1', role: 'assistant', content: 'Hello! I\'m your AI Deputy. How can I help you manage your venue today?' }]
      : [{ id: '1', role: 'assistant', content: `I'm ready to help with task ${activeContextId}. What would you like to know?` }],
  })
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  // Add task context when needed
  const addTaskContext = (taskId: string, taskTitle: string) => {
    const contextId = `task-${taskId}`
    if (!contexts.find(c => c.id === contextId)) {
      setContexts(prev => [...prev, {
        id: contextId,
        title: taskTitle,
        type: 'task',
        taskId,
      }])
    }
    setActiveContextId(contextId)
  }
  
  // Parse tool results from messages for special rendering
  const parseToolResult = (content: string) => {
    try {
      // Check if content contains tool result markers
      if (content.includes('Tasks found:') || content.includes('Task details:') || content.includes('Statistics:')) {
        return { type: 'structured', content }
      }
      return { type: 'text', content }
    } catch {
      return { type: 'text', content }
    }
  }
  
  const renderMessage = (message: any) => {
    const parsed = parseToolResult(message.content)
    
    if (parsed.type === 'structured') {
      return (
        <Card className="mt-2">
          <CardContent className="p-3">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
            </div>
          </CardContent>
        </Card>
      )
    }
    
    return (
      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
    )
  }
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Deputy</h2>
              <p className="text-xs text-slate-500">Your intelligent venue assistant</p>
            </div>
          </div>
        </div>
        
        {/* Context Tabs */}
        {contexts.length > 1 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {contexts.map(ctx => (
              <button
                key={ctx.id}
                onClick={() => setActiveContextId(ctx.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  activeContextId === ctx.id
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
                {ctx.type === 'task' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setContexts(prev => prev.filter(c => c.id !== ctx.id))
                      if (activeContextId === ctx.id) {
                        setActiveContextId('main')
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
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
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
                'max-w-[80%]',
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
                  {renderMessage(message)}
                </div>
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
                  <div className="animate-pulse flex gap-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animation-delay-200"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animation-delay-400"></div>
                  </div>
                  <span className="text-sm text-slate-500">AI Deputy is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Error: {error.message}</span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about your venue..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input?.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 max-w-3xl mx-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Use the setInput function from useChat to set value, then submit
              const form = document.querySelector('form') as HTMLFormElement
              const inputElement = form?.querySelector('input') as HTMLInputElement
              if (inputElement) {
                inputElement.value = 'Show pending tasks'
                handleInputChange({ target: inputElement } as any)
                setTimeout(() => form?.requestSubmit(), 10)
              }
            }}
            className="text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending Tasks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const form = document.querySelector('form') as HTMLFormElement
              const inputElement = form?.querySelector('input') as HTMLInputElement
              if (inputElement) {
                inputElement.value = 'Show venue statistics'
                handleInputChange({ target: inputElement } as any)
                setTimeout(() => form?.requestSubmit(), 10)
              }
            }}
            className="text-xs"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Statistics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const form = document.querySelector('form') as HTMLFormElement
              const inputElement = form?.querySelector('input') as HTMLInputElement
              if (inputElement) {
                inputElement.value = 'Show available workers'
                handleInputChange({ target: inputElement } as any)
                setTimeout(() => form?.requestSubmit(), 10)
              }
            }}
            className="text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            Workers
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  )
}