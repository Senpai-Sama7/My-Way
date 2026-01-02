'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Volume2, Network, Layout, Clock, Brain, HelpCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { SectionQuiz } from '@/components/section-quiz'
import type { LucideIcon } from 'lucide-react'
import { useKeyboardNav } from '@/hooks/use-keyboard-nav'
import { useAppStore } from '@/lib/store'

type ViewType = 'immersive-text' | 'slides' | 'audio' | 'mindmap'

interface Section {
  id: number
  title: string
  content: string
  embeddedQuestion?: {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }
  timeline?: {
    events: Array<{ date: string; title: string; description: string }>
  }
  memoryAid?: {
    term: string
    mnemonic: string
    explanation: string
  }
  visualIllustration?: {
    description: string
    placeholder: string
  }
}

interface SlidesContent {
  slides: Array<{
    title: string
    content: string
    keyPoints: string[]
  }>
}

interface AudioContent {
  conversation: Array<{
    speaker: 'teacher' | 'student'
    text: string
  }>
  visuals: string[]
}

interface MindmapContent {
  nodes: Array<{
    id: string
    label: string
    level: number
    children?: string[]
  }>
}

interface LearningViewProps {
  materialTitle: string
  category: string
  gradeLevel: number
  interest: string
  sections: Section[]
  slidesContent?: SlidesContent
  audioContent?: AudioContent
  mindmapContent?: MindmapContent
}

type QuizDifficulty = 'easy' | 'medium' | 'hard'
type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: QuizDifficulty
}

export function LearningView({
  materialTitle,
  category,
  gradeLevel,
  interest,
  sections,
  slidesContent,
  audioContent,
  mindmapContent,
}: LearningViewProps) {
  const { aiPreferences } = useAppStore()
  const [activeView, setActiveView] = useState<ViewType>('immersive-text')
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set())
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set())
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(new Map())
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [viewedViews, setViewedViews] = useState<Set<ViewType>>(new Set(['immersive-text']))
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [isQuizLoading, setIsQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [generatedSlides, setGeneratedSlides] = useState<SlidesContent | undefined>(slidesContent)
  const [generatedAudio, setGeneratedAudio] = useState<AudioContent | undefined>(audioContent)
  const [generatedMindmap, setGeneratedMindmap] = useState<MindmapContent | undefined>(mindmapContent)
  const [isSlidesLoading, setIsSlidesLoading] = useState(false)
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [isMindmapLoading, setIsMindmapLoading] = useState(false)
  const [slidesError, setSlidesError] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [mindmapError, setMindmapError] = useState<string | null>(null)
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null)
  const [isTtsLoading, setIsTtsLoading] = useState(false)
  const [isTtsPlaying, setIsTtsPlaying] = useState(false)
  const [ttsError, setTtsError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Track when user switches views
  useEffect(() => {
    setViewedViews((prev) => new Set(prev).add(activeView))
  }, [activeView])

  useEffect(() => setGeneratedSlides(slidesContent), [slidesContent])
  useEffect(() => setGeneratedAudio(audioContent), [audioContent])
  useEffect(() => setGeneratedMindmap(mindmapContent), [mindmapContent])

  useEffect(() => {
    return () => {
      if (ttsAudioUrl) URL.revokeObjectURL(ttsAudioUrl)
    }
  }, [ttsAudioUrl])

  const combinedContent = sections
    .map((s) => `${s.title}\n${s.content}`)
    .join('\n\n')

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => new Map(prev).set(questionId, optionIndex))
  }

  const handleSubmitAnswer = (questionId: string, correctAnswer: number) => {
    setAnsweredQuestions((prev) => new Set(prev).add(questionId))
    setShowAnswers((prev) => new Set(prev).add(questionId))
  }

  const toggleSectionQuiz = () => {
    setShowQuizModal((prev) => !prev)
  }

  const handleQuizComplete = (result: any, detailedResults: any[]) => {
    // In production, save to database
    setShowQuizModal(false)
  }

  const openQuiz = async () => {
    if (isQuizLoading) return
    setQuizError(null)

    try {
      setIsQuizLoading(true)
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialTitle,
          gradeLevel,
          interest,
          totalQuestions: 10,
          sections: sections.map((s) => ({ title: s.title, content: s.content })),
          aiConfig: aiPreferences,
        }),
      })

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || 'Failed to generate quiz')
      }

      const data = await res.json()
      if (!data?.questions || !Array.isArray(data.questions)) {
        throw new Error('Quiz API returned an unexpected response.')
      }

      setQuizQuestions(data.questions)
      setShowQuizModal(true)
    } catch (e) {
      console.error(e)
      setQuizError(e instanceof Error ? e.message : 'Failed to open quiz')
    } finally {
      setIsQuizLoading(false)
    }
  }

  const renderImmersiveText = () => (
    <div className="space-y-6">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id)
        const hasEmbeddedContent = section.embeddedQuestion || section.timeline || section.memoryAid || section.visualIllustration
        const embeddedQuestion = section.embeddedQuestion

        return (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {hasEmbeddedContent && (
                    <Badge variant="secondary" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      Enhanced
                    </Badge>
                  )}
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="space-y-4 pt-0">
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                  {section.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>

                {embeddedQuestion && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Quick Check</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm font-medium">{embeddedQuestion.question}</p>
                      <div className="space-y-2">
                        {embeddedQuestion.options.map((option, idx) => {
                          const questionId = embeddedQuestion.id
                          const isSelected = selectedAnswers.get(questionId) === idx
                          const isAnswered = answeredQuestions.has(questionId)

                          return (
                            <Button
                              key={idx}
                              variant={isSelected ? 'default' : 'outline'}
                              onClick={() => !isAnswered && handleAnswerSelect(questionId, idx)}
                              className={`w-full justify-start text-left ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-lg'
                                  : 'border-2'
                              }`}
                            >
                              <span className="mr-2">{['A', 'B', 'C', 'D'][idx]}.</span>
                              <span className="text-sm">{option}</span>
                              {isAnswered && idx === embeddedQuestion.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                              )}
                            </Button>
                          )
                        })}
                      </div>
                      {!answeredQuestions.has(embeddedQuestion.id) && (
                        <Button
                          onClick={() => handleSubmitAnswer(embeddedQuestion.id, embeddedQuestion.correctAnswer)}
                          disabled={selectedAnswers.get(embeddedQuestion.id) === undefined}
                          className="w-full"
                        >
                          Check Answer
                        </Button>
                      )}
                      {answeredQuestions.has(embeddedQuestion.id) && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-600 font-medium">
                              {selectedAnswers.get(embeddedQuestion.id) === embeddedQuestion.correctAnswer
                                ? 'Correct!'
                                : 'Not quite right'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {embeddedQuestion.explanation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {section.timeline && (
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Timeline</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {section.timeline.events.map((event, idx) => (
                          <div key={idx} className="flex gap-3">
                            <Badge variant="outline" className="mt-1 whitespace-nowrap">
                              {event.date}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {section.memoryAid && (
                  <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <CardTitle className="text-base">Memory Aid</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-semibold text-sm">Remember: <span className="text-orange-600 dark:text-orange-400">"{section.memoryAid.mnemonic}"</span></p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{section.memoryAid.term}:</span> {section.memoryAid.explanation}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {section.visualIllustration && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Visual Illustration</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-sm text-muted-foreground text-center px-4">
                          {section.visualIllustration.placeholder}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {section.visualIllustration.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )

  const renderSlides = () => (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6 p-4">
        {!generatedSlides?.slides?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Slides</CardTitle>
              <CardDescription>
                Generate an age-appropriate slide deck from the material.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {slidesError ? slidesError : 'No slides generated yet.'}
              </p>
              <Button
                onClick={async () => {
                  if (isSlidesLoading) return
                  setSlidesError(null)
                  try {
                    setIsSlidesLoading(true)
                    const res = await fetch('/api/generate-slides', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        content: combinedContent,
                        materialTitle,
                        gradeLevel,
                        interest,
                        aiConfig: aiPreferences,
                      }),
                    })

                    if (!res.ok) {
                      const msg = await res.json().catch(() => ({}))
                      throw new Error(msg?.error || 'Failed to generate slides')
                    }

                    const data = await res.json()
                    setGeneratedSlides({ slides: Array.isArray(data.slides) ? data.slides : [] })
                  } catch (e) {
                    console.error(e)
                    setSlidesError(e instanceof Error ? e.message : 'Failed to generate slides')
                  } finally {
                    setIsSlidesLoading(false)
                  }
                }}
                disabled={isSlidesLoading || !combinedContent.trim()}
              >
                {isSlidesLoading ? 'Generating…' : 'Generate Slides'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          generatedSlides.slides.map((slide, idx) => (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Slide {idx + 1}</Badge>
              </div>
              <CardTitle className="text-2xl">{slide.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <p>{slide.content}</p>
              </div>
              {slide.keyPoints.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {slide.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))
        )}
      </div>
    </ScrollArea>
  )

  const renderAudio = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Audio Lesson</CardTitle>
          <CardDescription>
            Listen to a conversational lesson about {materialTitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <audio
            ref={audioRef}
            src={ttsAudioUrl || undefined}
            onEnded={() => setIsTtsPlaying(false)}
            className="hidden"
          />
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {generatedAudio?.conversation.map((turn, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${turn.speaker === 'student' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      turn.speaker === 'teacher'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {turn.speaker === 'teacher' ? 'T' : 'S'}
                  </div>
                  <div
                    className={`flex-1 rounded-lg p-4 text-sm ${
                      turn.speaker === 'teacher'
                        ? 'bg-primary/10'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="leading-relaxed">{turn.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              disabled={isAudioLoading || isTtsLoading || !combinedContent.trim()}
              onClick={async () => {
                if (isAudioLoading || isTtsLoading) return

                try {
                  setAudioError(null)
                  setTtsError(null)
                  setIsAudioLoading(true)

                  let audioLesson = generatedAudio

                  if (!audioLesson?.conversation?.length) {
                    const res = await fetch('/api/generate-audio', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        content: combinedContent,
                        materialTitle,
                        gradeLevel,
                        interest,
                        aiConfig: aiPreferences,
                      }),
                    })

                    if (!res.ok) {
                      const msg = await res.json().catch(() => ({}))
                      throw new Error(msg?.error || 'Failed to generate audio lesson')
                    }

                    const data = await res.json()
                    audioLesson = {
                      conversation: Array.isArray(data.conversation) ? data.conversation : [],
                      visuals: Array.isArray(data.visuals) ? data.visuals : [],
                    }
                    setGeneratedAudio(audioLesson)
                    if (ttsAudioUrl) URL.revokeObjectURL(ttsAudioUrl)
                    setTtsAudioUrl(null)
                  }

                  setIsAudioLoading(false)
                  setIsTtsLoading(true)

                  if (!ttsAudioUrl) {
                    const script = (audioLesson?.conversation ?? [])
                      .map((t) => `${t.speaker === 'teacher' ? 'Teacher' : 'Student'}: ${t.text}`)
                      .join('\n\n')

                    const res = await fetch('/api/tts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: script, format: 'wav' }),
                    })

                    if (!res.ok) {
                      const msg = await res.json().catch(() => ({}))
                      throw new Error(msg?.error || 'Failed to generate audio')
                    }

                    const buf = await res.arrayBuffer()
                    const blob = new Blob([buf], { type: res.headers.get('content-type') || 'audio/wav' })
                    const url = URL.createObjectURL(blob)
                    setTtsAudioUrl(url)
                  }

                  setTimeout(async () => {
                    if (!audioRef.current) return
                    await audioRef.current.play()
                    setIsTtsPlaying(true)
                  }, 0)
                } catch (e) {
                  console.error(e)
                  setAudioError(e instanceof Error ? e.message : 'Failed to generate audio lesson')
                } finally {
                  setIsAudioLoading(false)
                  setIsTtsLoading(false)
                }
              }}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              {isAudioLoading || isTtsLoading ? 'Generating…' : isTtsPlaying ? 'Playing…' : 'Generate & Play'}
            </Button>
            <Button
              className="ml-2"
              variant="ghost"
              disabled={!ttsAudioUrl || isTtsLoading}
              onClick={() => {
                audioRef.current?.pause()
                setIsTtsPlaying(false)
              }}
            >
              Pause
            </Button>
          </div>
          {(audioError || ttsError) && (
            <p className="text-sm text-destructive mt-3 text-center">{audioError || ttsError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderMindmap = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mind Map</CardTitle>
          <CardDescription>
            Visual overview of concepts and relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedMindmap?.nodes?.length ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {mindmapError ? mindmapError : 'No mind map generated yet.'}
              </p>
              <Button
                onClick={async () => {
                  if (isMindmapLoading) return
                  setMindmapError(null)
                  try {
                    setIsMindmapLoading(true)
                    const res = await fetch('/api/generate-mindmap', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        content: combinedContent,
                        materialTitle,
                        gradeLevel,
                        interest,
                        aiConfig: aiPreferences,
                      }),
                    })

                    if (!res.ok) {
                      const msg = await res.json().catch(() => ({}))
                      throw new Error(msg?.error || 'Failed to generate mind map')
                    }

                    const data = await res.json()
                    setGeneratedMindmap({ nodes: Array.isArray(data.nodes) ? data.nodes : [] })
                  } catch (e) {
                    console.error(e)
                    setMindmapError(e instanceof Error ? e.message : 'Failed to generate mind map')
                  } finally {
                    setIsMindmapLoading(false)
                  }
                }}
                disabled={isMindmapLoading || !combinedContent.trim()}
              >
                {isMindmapLoading ? 'Generating…' : 'Generate Mind Map'}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {generatedMindmap.nodes.map((node) => (
                  <div
                    key={node.id}
                    style={{ marginLeft: `${node.level * 24}px` }}
                    className="relative"
                  >
                    <div
                      className={`p-3 rounded-lg border ${
                        node.level === 0
                          ? 'bg-primary text-primary-foreground'
                          : node.level === 1
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-muted'
                      }`}
                    >
                      <p className={`font-medium ${node.level > 0 ? 'text-sm' : 'text-lg'}`}>
                        {node.label}
                      </p>
                    </div>
                    {node.children && node.children.length > 0 && (
                      <div className="absolute left-0 top-6 w-0.5 h-full bg-border -translate-x-3/4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const totalQuestions = sections.filter(s => s.embeddedQuestion).length
  const answeredCount = answeredQuestions.size

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="space-y-4">
          <Badge variant="outline">{category}</Badge>
          <h1 className="text-3xl font-bold">{materialTitle}</h1>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">Grade {gradeLevel}</Badge>
            {interest && (
              <Badge variant="secondary">Interest: {interest}</Badge>
            )}
          </div>
        </div>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewType)} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-full sm:w-auto">
              <TabsTrigger value="immersive-text" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Immersive Text</span>
              </TabsTrigger>
              <TabsTrigger value="slides" className="gap-2">
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Slides</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Audio Lesson</span>
              </TabsTrigger>
              <TabsTrigger value="mindmap" className="gap-2">
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Mind Map</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="immersive-text">
            {renderImmersiveText()}
          </TabsContent>

          <TabsContent value="slides">
            {renderSlides()}
          </TabsContent>

          <TabsContent value="audio">
            {renderAudio()}
          </TabsContent>

          <TabsContent value="mindmap">
            {renderMindmap()}
          </TabsContent>
        </Tabs>

        {/* Quiz Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Section Quiz</CardTitle>
                <CardDescription>
                  Test your understanding of this material
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showQuizModal ? 'default' : 'outline'}
                  onClick={openQuiz}
                  disabled={sections.length === 0 || isQuizLoading}
                  className="gap-2"
                >
                  {isQuizLoading ? 'Generating…' : 'Take Quiz'}
                  <Brain className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        {quizError && (
          <p className="text-sm text-destructive text-center">{quizError}</p>
        )}

        {/* Quiz Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Section Quiz</h2>
                    <p className="text-muted-foreground">
                      Review your answers before submitting
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => setShowQuizModal(false)}>
                    ✕
                  </Button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-4">
                  <SectionQuiz
                    title={materialTitle}
                    questions={quizQuestions}
                    onComplete={handleQuizComplete}
                    onClose={() => setShowQuizModal(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {sections.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Sections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {expandedSections.size}
                    </p>
                    <p className="text-sm text-muted-foreground">Sections Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {answeredCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Keep learning! Answer embedded questions and complete sections to track your progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
