'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Send,
  Bot,
  User,
  Sparkles,
  BrainCircuit,
  Volume2,
  Image as ImageIcon,
  RefreshCw,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  BookMarked,
  Bookmark,
  ChevronUp,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: 'text' | 'explanation' | 'example' | 'practice' | 'visual'
  metadata?: {
    topic?: string
    difficulty?: number
    examples?: string[]
    practiceProblems?: any[]
  }
  timestamp: Date
}

interface SuggestedTopic {
  id: string
  title: string
  description: string
  category: string
}

const suggestedTopics: SuggestedTopic[] = [
  { id: '1', title: 'Quantum Physics Basics', description: 'Understand the strange world of quantum mechanics', category: 'Science' },
  { id: '2', title: 'Ancient Rome Economy', description: 'How Rome managed its vast economic empire', category: 'History' },
  { id: '3', title: 'Machine Learning Introduction', description: 'Start your journey into AI and ML', category: 'Technology' },
  { id: '4', title: 'Calculus Fundamentals', description: 'Master the foundations of differential calculus', category: 'Math' },
  { id: '5', title: 'Climate Change Science', description: 'Understanding Earth\'s changing climate', category: 'Science' },
  { id: '6', title: 'Creative Writing Techniques', description: 'Transform your storytelling abilities', category: 'Language Arts' },
]

export function ConversationalLearning() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [difficulty, setDifficulty] = useState(7)
  const [interest, setInterest] = useState('')
  const [currentTopic, setCurrentTopic] = useState('')
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set())
  const [isPaused, setIsPaused] = useState(false)
  const [activeView, setActiveView] = useState<'chat' | 'visual' | 'practice'>('chat')
  const { aiPreferences } = useAppStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      type: 'text',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/conversational-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic || 'any',
          question: userMessage.content,
          difficulty,
          interest,
          context: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
          aiConfig: aiPreferences,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const result = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        type: result.type || 'explanation',
        metadata: result.metadata,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (result.suggestedTopics) {
        setCurrentTopic(result.suggestedTopics[0])
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'text',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestedTopic = async (topic: SuggestedTopic) => {
    setCurrentTopic(topic.title)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `I want to learn about ${topic.title}`,
      type: 'text',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await fetch('/api/conversational-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.title,
          question: `Tell me about ${topic.title}`,
          difficulty,
          interest,
          context: [],
          aiConfig: aiPreferences,
        }),
      })

      const result = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        type: 'explanation',
        metadata: { topic: topic.title },
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleRequestExample = async () => {
    if (messages.length === 0) return

    const lastTopicMessage = messages.filter((m) => m.role === 'assistant').slice(-1)[0]
    if (!lastTopicMessage) return

    setIsTyping(true)

    try {
      const response = await fetch('/api/generate-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic || lastTopicMessage.metadata?.topic || 'the current topic',
          difficulty,
          interest,
        }),
      })

      const result = await response.json()

      const exampleMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.content,
        type: 'example',
        metadata: result.metadata,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, exampleMessage])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleRequestPractice = async () => {
    if (messages.length === 0) return

    const lastTopicMessage = messages.filter((m) => m.role === 'assistant').slice(-1)[0]
    if (!lastTopicMessage) return

    setIsTyping(true)

    try {
      const response = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic || lastTopicMessage.metadata?.topic || 'the current topic',
          difficulty,
        }),
      })

      const result = await response.json()

      const practiceMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.content,
        type: 'practice',
        metadata: result.metadata,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, practiceMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleBookmark = (messageId: string) => {
    setBookmarkedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const getDifficultyLabel = (level: number) => {
    if (level <= 6) return 'Beginner'
    if (level <= 8) return 'Intermediate'
    if (level <= 10) return 'Advanced'
    return 'Expert'
  }

  const getMessageIcon = (message: Message) => {
    switch (message.type) {
      case 'example':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case 'practice':
        return <BrainCircuit className="h-5 w-5 text-purple-500" />
      case 'visual':
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      default:
        return message.role === 'assistant' ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5" />
    }
  }

  const getMessageTypeBadge = (message: Message) => {
    switch (message.type) {
      case 'example':
        return <Badge variant="secondary" className="gap-1"><Lightbulb className="h-3 w-3" />Example</Badge>
      case 'practice':
        return <Badge variant="secondary" className="gap-1"><BrainCircuit className="h-3 w-3" />Practice</Badge>
      case 'visual':
        return <Badge variant="secondary" className="gap-1"><ImageIcon className="h-3 w-3" />Visual</Badge>
      default:
        return null
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container py-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Learn Anything</h1>
                <p className="text-sm text-muted-foreground">
                  Dynamic, personalized learning at your own pace
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              setMessages([])
              setCurrentTopic('')
            }} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              New Session
            </Button>
          </div>

          {/* Topic Input */}
          {messages.length === 0 && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-6">
                <div className="text-center mb-4">
                  <Bot className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h2 className="text-xl font-semibold mb-1">What would you like to learn today?</h2>
                  <p className="text-sm text-muted-foreground">
                    Ask me about any topic - I'll create a personalized learning experience just for you
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty Level: {getDifficultyLabel(difficulty)}</label>
                    <Slider
                      value={[difficulty]}
                      onValueChange={(v) => setDifficulty(v[0])}
                      min={6}
                      max={13}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="interest" className="text-sm font-medium">Your Interest (Optional)</label>
                    <Input
                      id="interest"
                      type="text"
                      placeholder="e.g., sports, music, gaming, cooking..."
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Popular Topics:</p>
                  <ScrollArea className="h-32">
                    <div className="flex gap-2 pb-2">
                      {suggestedTopics.map((topic) => (
                        <Button
                          key={topic.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedTopic(topic)}
                          className="whitespace-nowrap"
                        >
                          {topic.title}
                          <Badge variant="secondary" className="ml-2 text-xs">{topic.category}</Badge>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Topic Display */}
          {currentTopic && messages.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-base px-4 py-2">
                  {currentTopic}
                </Badge>
                {interest && (
                  <Badge variant="outline">{interest}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRequestExample}
                  disabled={isTyping}
                  className="gap-1"
                >
                  <Lightbulb className="h-3 w-3" />
                  Examples
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRequestPractice}
                  disabled={isTyping}
                  className="gap-1"
                >
                  <BrainCircuit className="h-3 w-3" />
                  Practice
                </Button>
                {isPaused ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPaused(false)}
                    className="gap-1"
                  >
                    <PlayCircle className="h-3 w-3" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPaused(true)}
                    className="gap-1"
                  >
                    <PauseCircle className="h-3 w-3" />
                    Pause
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollRef} className="h-full">
          <div className="container py-6 space-y-6">
            {messages.length === 0 && !currentTopic && (
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md text-center">
                  <CardContent className="py-8 space-y-4">
                    <Sparkles className="h-16 w-16 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Start Your Learning Journey</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Type a question or select a topic above to begin. I'll transform any topic into an engaging, personalized learning experience tailored specifically for you.
                    </p>
                    <div className="space-y-2 text-left text-sm bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p>Ask questions and get instant explanations</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p>Request personalized examples based on your interests</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p>Get practice problems to test understanding</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p>Adjust difficulty as you progress</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p>Learn at your own pace - pause anytime</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {getMessageIcon(message)}
                </div>
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary/10'
                      : 'bg-muted/50'
                  } rounded-2xl p-4`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {message.role === 'user' ? 'You' : 'AI Tutor'}
                      </span>
                      {getMessageTypeBadge(message)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(message.id)}
                      className="h-6 w-6 p-0"
                    >
                      {bookmarkedSections.has(message.id) ? (
                        <BookMarked className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm leading-relaxed">
                    {message.content.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                  {message.metadata?.examples && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Examples:</p>
                      <div className="space-y-2">
                        {message.metadata.examples.map((example: string, idx: number) => (
                          <div
                            key={idx}
                            className="bg-primary/5 rounded-lg p-3 text-sm"
                          >
                            <p>{example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {message.metadata?.practiceProblems && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Practice Problems:</p>
                      <div className="space-y-3">
                        {message.metadata.practiceProblems.map((problem: any, idx: number) => (
                          <Card key={idx} className="bg-primary/5">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{problem.question}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {problem.options && (
                                <div className="space-y-1">
                                  {problem.options.map((option: string, optIdx: number) => (
                                    <div
                                      key={optIdx}
                                      className={`p-2 rounded border-2 cursor-pointer hover:border-primary/50 transition-colors ${
                                        problem.showAnswer && optIdx === problem.correctAnswer
                                          ? 'bg-green-500/10 border-green-500'
                                          : 'border-muted'
                                      }`}
                                    >
                                      <span className="text-sm">
                                        {['A', 'B', 'C', 'D'][optIdx]}. {option}
                                      </span>
                                      {problem.showAnswer && optIdx === problem.correctAnswer && (
                                        <span className="text-xs text-green-600 ml-2">
                                          ✓ Correct!
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {problem.showAnswer && (
                                <p className="text-xs text-muted-foreground">
                                  {problem.explanation}
                                </p>
                              )}
                              {!problem.showAnswer && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setMessages((prev) =>
                                      prev.map((msg) =>
                                        msg.id === message.id
                                          ? {
                                              ...msg,
                                              metadata: {
                                                ...msg.metadata!,
                                                practiceProblems: msg.metadata?.practiceProblems?.map(
                                                  (p: any, i: number) =>
                                                    i === idx ? { ...p, showAnswer: true } : p
                                                ),
                                              },
                                            }
                                          : msg
                                      )
                                    )
                                  }}
                                >
                                  Show Answer
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-5 w-5 text-muted-foreground animate-pulse" />
                </div>
                <div className="bg-muted/50 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background">
        <div className="container py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={
                  messages.length === 0
                    ? 'Tell me what you want to learn about...'
                    : 'Ask a question, request examples, or request practice problems...'
                }
                className="min-h-[60px] pr-12"
                disabled={isTyping || isPaused}
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping || isPaused}
                className="absolute right-2 bottom-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {currentTopic && (
              <Button
                variant="outline"
                onClick={() => {
                  setMessages([])
                  setCurrentTopic('')
                }}
              >
                Change Topic
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
