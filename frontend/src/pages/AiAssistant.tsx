import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  RefreshCw,
  Trash2,
  Key,
  Calendar,
  DollarSign,
  BookOpen,
  Clock,
  Activity,
  CheckCircle
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { useToastStore } from '../stores/toastStore'
import { useAuthStore } from '../stores/authStore'

interface Message {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const AiAssistant: React.FC = () => {
  const { addToast } = useToastStore()
  const { token } = useAuthStore()

  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your SoloLife OS AI productivity partner. Click any of the triggered buttons below to let me scan your dashboard logs and generate custom plans, goal reviews, or finance feedback!"
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Settings state
  const [openRouterKey, setOpenRouterKey] = useState(() => {
    return localStorage.getItem('sololife_openrouter_api_key') || ''
  })
  const [selectedModel, setSelectedModel] = useState('meta-llama/llama-3-8b-instruct:free')

  // Chat window auto-scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Save API Key helper
  const handleSaveKey = () => {
    localStorage.setItem('sololife_openrouter_api_key', openRouterKey)
    addToast('OpenRouter API Key saved locally!', 'success')
  }

  // Trigger prompts list
  const triggers = [
    {
      label: '📅 Daily Planning',
      icon: <Calendar className="text-sky-500" size={14} />,
      prompt: 'Based on my today schedule, plan a balanced day prioritizing important tasks.',
      context: 'Today Tasks Checklist:\n- Write AST Parser in TS\n- Linear Algebra homework #3\n- Organic Chemistry Lab Report'
    },
    {
      label: '📊 Finance Analysis',
      icon: <DollarSign className="text-emerald-500" size={14} />,
      prompt: 'Analyze my transaction cashflow and check if I am exceeding any category budgets.',
      context: 'Budgets: Food limit $300, Utilities limit $150, Entertainment limit $100.\nTransactions: Freelance income +$2500, Groceries -$124.50, Electric Bill -$85, Office Chair -$180.'
    },
    {
      label: '💡 Habit Suggestions',
      icon: <CheckCircle className="text-pink-500" size={14} />,
      prompt: 'Suggest 3 micro-habits to build focus and study consistency.',
      context: 'Active Habits: Morning Meditation (Current Streak: 4 days), Drink 3L Water (Current Streak: 12 days).'
    },
    {
      label: '📝 Journal Summary',
      icon: <BookOpen className="text-purple-500" size={14} />,
      prompt: 'Analyze my journal entries from the past few days. Summarize my general mood and lessons.',
      context: 'Journal Entry 1 (😄): Finished scaffolding core frontend pages. Excited.\nJournal Entry 2 (😐): Debugged Vite module issues late night. Tired.'
    },
    {
      label: '🏫 Study Planner',
      icon: <Clock className="text-indigo-500" size={14} />,
      prompt: 'Create a revision schedule for my upcoming exam dates.',
      context: 'Exams Scheduled: Data Structures Midterm (2026-08-05, Target: A+), Calculus Final Exam (2026-08-12, Target: A).'
    },
    {
      label: '📈 Productivity Insights',
      icon: <Activity className="text-amber-500" size={14} />,
      prompt: 'Analyze my overall daily stats and suggest optimization changes.',
      context: 'Daily Stats: Steps 6540/10000, Water 1500/3000ml, Study hours: Computer Science 8h, Math 5h, Chemistry 3h.'
    }
  ]

  // Submit trigger
  const handleTrigger = async (promptText: string, contextText: string) => {
    if (isGenerating) return

    if (!openRouterKey.trim()) {
      addToast('Please save your OpenRouter API Key first to run chat prompts.', 'warning')
      return
    }

    const systemPrompt = `You are a productivity partner. Context on user's active dashboard:\n${contextText}`
    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: promptText
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsGenerating(true)

    // Setup streaming message slot
    const assistantMessageId = `a-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: 'Connecting and analyzing logs...' }
    ])

    try {
      const allMsgsForApi = [
        { role: 'system', content: systemPrompt },
        ...updatedMessages.map((m) => ({ role: m.role, content: m.content }))
      ]

      const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-OpenRouter-Key': openRouterKey
        },
        body: JSON.stringify({
          messages: allMsgsForApi,
          model: selectedModel
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start chat streaming')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      if (reader) {
        // Clear placeholder text
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: '' } : msg))
        )

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          assistantText += chunk

          // Update real-time chunk stream
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: assistantText } : msg))
          )
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: `Error generating insight. Make sure your API key is correct and valid. Details: ${err.message}` }
            : msg
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle manual input text submit
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isGenerating) return

    const prompt = inputText
    setInputText('')
    // Trigger with general aggregated dashboard context
    const aggregatedContext = 'Dashboard Context: General productivity study sessions and finance budgets.'
    await handleTrigger(prompt, aggregatedContext)
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I am your SoloLife OS AI productivity partner. Click any of the triggered buttons below to let me scan your dashboard logs and generate custom plans, goal reviews, or finance feedback!"
      }
    ])
    addToast('Chat thread cleared!', 'info')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start max-w-6xl mx-auto pb-12">
      {/* Settings left panel */}
      <div className="space-y-6">
        <Card variant="white" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key className="text-sky-500 w-5 h-5 shrink-0" />
            <h2 className="font-bold text-slate-800 text-sm">OpenRouter Keys</h2>
          </div>

          <div className="space-y-3">
            <Input
              label="API Key"
              type="password"
              placeholder="sk-or-v1-..."
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
            />
            <Button onClick={handleSaveKey} size="sm" className="w-full">
              Save Key
            </Button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <Select
              label="Selected Model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              options={[
                { value: 'meta-llama/llama-3-8b-instruct:free', label: 'Llama 3 8B (Free)' },
                { value: 'google/gemma-2-9b-it:free', label: 'Gemma 2 9B (Free)' },
                { value: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B (Free)' },
                { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' }
              ]}
            />
          </div>
        </Card>

        {/* Action triggers */}
        <Card variant="white" className="space-y-3">
          <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">AI Trigger Triggers</h3>
          <div className="space-y-1.5">
            {triggers.map((trig, idx) => (
              <button
                key={idx}
                onClick={() => handleTrigger(trig.prompt, trig.context)}
                disabled={isGenerating}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl text-[10px] font-bold text-slate-650 hover:bg-slate-50 border border-slate-100/50 hover:border-slate-200 transition-all text-left cursor-pointer disabled:opacity-50"
              >
                {trig.icon}
                <span className="truncate">{trig.label.substring(2)}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Main chat window */}
      <div className="lg:col-span-3 space-y-4 flex flex-col h-[600px]">
        <Card variant="white" className="flex-1 flex flex-col justify-between overflow-hidden relative border border-slate-150 p-6 h-full">
          {/* Chat header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="text-sky-500" size={18} />
              <div>
                <h3 className="font-extrabold text-slate-850 text-xs">SoloLife AI Assistant</h3>
                <span className="text-[8px] font-bold uppercase tracking-wide text-emerald-500">Streaming Enabled</span>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-1.5 text-slate-350 hover:text-rose-500 transition-colors cursor-pointer"
              title="Clear conversation history"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Messages body scrolling view */}
          <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2 scrollbar-thin">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant'
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    isAssistant ? 'self-start' : 'self-end flex-row-reverse ml-auto'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isAssistant ? 'bg-sky-50 text-sky-500 border-sky-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {isAssistant ? <Bot size={14} /> : <User size={14} />}
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                    isAssistant
                      ? 'bg-slate-50 text-slate-700 border border-slate-100'
                      : 'bg-sky-500 text-white shadow-xs'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* User chat input form */}
          <form onSubmit={handleSendText} className="flex gap-2 border-t border-slate-100 pt-3">
            <input
              type="text"
              placeholder="Ask anything or click a trigger prompt on the left..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 transition-all text-slate-800"
              disabled={isGenerating}
            />
            <Button type="submit" disabled={isGenerating || !inputText.trim()} className="px-4 py-2 rounded-2xl flex items-center justify-center">
              {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
