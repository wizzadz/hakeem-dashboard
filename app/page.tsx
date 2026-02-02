'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Activity, GitCommit, CheckSquare, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Agent {
  id: string
  label: string
  status: 'working' | 'idle' | 'completed' | 'failed'
  runtime?: string
}

interface Commit {
  sha: string
  message: string
  date: string
  url: string
}

interface Task {
  text: string
  completed: boolean
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hey Mike 🦅 Dashboard is live. What do you need?', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [commits, setCommits] = useState<Commit[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [progress, setProgress] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch initial data
  useEffect(() => {
    fetchAgents()
    fetchCommits()
    fetchProgress()
    
    // Poll for updates
    const interval = setInterval(() => {
      fetchAgents()
      fetchCommits()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents')
      if (res.ok) {
        const data = await res.json()
        setAgents(data.agents || [])
      }
    } catch (e) {
      console.error('Failed to fetch agents:', e)
    }
  }

  const fetchCommits = async () => {
    try {
      const res = await fetch('/api/github')
      if (res.ok) {
        const data = await res.json()
        setCommits(data.commits || [])
      }
    } catch (e) {
      console.error('Failed to fetch commits:', e)
    }
  }

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
        setProgress(data.progress || 0)
      }
    } catch (e) {
      console.error('Failed to fetch progress:', e)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      })
      
      const data = await res.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Sorry, something went wrong.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to connect. Is Clawdbot running?',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-[var(--card)] border-r border-[var(--border)] p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-xl">
            🦅
          </div>
          <div>
            <h1 className="font-bold">Hakeem</h1>
            <p className="text-xs text-gray-400">AI Assistant</p>
          </div>
        </div>
        
        {/* Sprint Progress */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
            <CheckSquare size={14} /> Sprint Progress
          </h2>
          <div className="bg-[var(--background)] rounded-full h-2 mb-2">
            <div 
              className="bg-[var(--primary)] h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{progress}% complete</p>
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {tasks.map((task, i) => (
              <div key={i} className="text-xs flex items-center gap-1">
                <span className={task.completed ? 'text-green-500' : 'text-gray-500'}>
                  {task.completed ? '✓' : '○'}
                </span>
                <span className={task.completed ? 'text-gray-400 line-through' : ''}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Agents */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
            <Activity size={14} /> Active Agents
          </h2>
          <div className="space-y-2">
            {agents.length === 0 ? (
              <p className="text-xs text-gray-500">No active agents</p>
            ) : (
              agents.map(agent => (
                <div key={agent.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      agent.status === 'working' ? 'bg-yellow-500 animate-pulse' :
                      agent.status === 'completed' ? 'bg-green-500' :
                      agent.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    {agent.label || agent.id.slice(0, 8)}
                  </span>
                  <span className="text-gray-500">{agent.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Recent Commits */}
        <div className="flex-1 overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
            <GitCommit size={14} /> Recent Commits
          </h2>
          <div className="space-y-2 overflow-y-auto max-h-48">
            {commits.length === 0 ? (
              <p className="text-xs text-gray-500">No commits yet</p>
            ) : (
              commits.slice(0, 5).map(commit => (
                <a 
                  key={commit.sha}
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs hover:bg-[var(--card-hover)] p-1 rounded"
                >
                  <p className="text-gray-300 truncate">{commit.message}</p>
                  <p className="text-gray-500">{commit.sha.slice(0, 7)} · {commit.date}</p>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-[var(--border)] flex items-center px-6">
          <h2 className="font-semibold">Chat with Hakeem</h2>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-[70%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-[var(--primary)] text-white' 
                  : 'bg-[var(--card)] border border-[var(--border)]'
              }`}>
                <ReactMarkdown className="text-sm prose prose-invert prose-sm max-w-none">
                  {msg.content}
                </ReactMarkdown>
                <p className="text-xs opacity-50 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3">
                <Loader2 className="animate-spin" size={16} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Hakeem..."
              className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 resize-none focus:outline-none focus:border-[var(--primary)] text-sm"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
