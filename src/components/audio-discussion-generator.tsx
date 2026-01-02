'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Upload, Volume2, Play, Pause, RotateCcw, User, UserCircle, Loader2, AlertCircle } from 'lucide-react'

interface Speaker {
  name: string
  role: 'moderator' | 'expert' | 'skeptic'
}

interface DiscussionTurn {
  speaker: string
  role: 'moderator' | 'expert' | 'skeptic'
  text: string
}

interface AudioDiscussion {
  title: string
  summary: string
  speakers: Speaker[]
  discussion: DiscussionTurn[]
  keyPoints: string[]
}

export function AudioDiscussionGenerator() {
  const [inputType, setInputType] = useState<'paste' | 'upload'>('paste')
  const [paperContent, setPaperContent] = useState('')
  const [title, setTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [discussion, setDiscussion] = useState<AudioDiscussion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSpeaker, setCurrentSpeaker] = useState<string>('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const handleGenerate = async () => {
    if (!paperContent.trim()) {
      setError('Please provide the academic paper content')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-audio-discussion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Paper',
          content: paperContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate discussion')
      }

      const result = await response.json()
      setDiscussion(result)
    } catch (err) {
      setError('Failed to generate discussion. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setPaperContent('')
    setTitle('')
    setDiscussion(null)
    setError(null)
    setCurrentSpeaker('')
    setIsPlaying(false)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'moderator':
        return 'bg-blue-500'
      case 'expert':
        return 'bg-green-500'
      case 'skeptic':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'moderator':
        return <UserCircle className="h-4 w-4" />
      case 'expert':
        return <User className="h-4 w-4" />
      case 'skeptic':
        return <User className="h-4 w-4" />
      default:
        return <UserCircle className="h-4 w-4" />
    }
  }

  const getDiscussionScript = (d: AudioDiscussion) =>
    d.discussion.map((turn) => `${turn.speaker}: ${turn.text}`).join('\n\n')

  const handlePlay = async () => {
    if (!discussion) return
    if (isAudioLoading) return

    try {
      setError(null)
      setIsAudioLoading(true)

      if (!audioUrl) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: getDiscussionScript(discussion),
            format: 'wav',
          }),
        })

        if (!res.ok) {
          const msg = await res.json().catch(() => ({}))
          throw new Error(msg?.error || 'Failed to generate audio')
        }

        const buf = await res.arrayBuffer()
        const blob = new Blob([buf], { type: res.headers.get('content-type') || 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      // Wait a tick for audioUrl to bind to <audio />
      setTimeout(async () => {
        if (!audioRef.current) return
        await audioRef.current.play()
        setIsPlaying(true)
      }, 0)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Failed to play audio')
    } finally {
      setIsAudioLoading(false)
    }
  }

  const handlePause = () => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Academic Paper to Audio Discussion</h1>
        <p className="text-muted-foreground">
          Transform academic papers into engaging AI-generated audio discussions between experts
        </p>
      </div>

      {!discussion ? (
        <Card>
          <CardHeader>
            <CardTitle>Import Your Paper</CardTitle>
            <CardDescription>
              Paste or upload your academic paper content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="paper-title" className="text-sm font-medium">
                Paper Title (Optional)
              </label>
              <input
                id="paper-title"
                type="text"
                placeholder="Enter the paper title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="paper-content" className="text-sm font-medium">
                Paper Content
              </label>
              <Textarea
                id="paper-content"
                placeholder="Paste your academic paper content here (abstract, introduction, methodology, results, discussion, etc.)..."
                value={paperContent}
                onChange={(e) => setPaperContent(e.target.value)}
                className="min-h-[300px]"
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{paperContent.length} characters</span>
                <span>Recommended: 1000-10000 characters</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !paperContent.trim()}
                className="flex-1 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Discussion...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Generate Audio Discussion
                  </>
                )}
              </Button>
              {paperContent && (
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">Discussion Ready</Badge>
              <h2 className="text-2xl font-bold">{discussion.title}</h2>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Discussion Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {discussion.summary}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Points</CardTitle>
              <CardDescription>
                Main takeaways from the discussion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <ul className="space-y-2 pr-4">
                  {discussion.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-2">
                      <Badge variant="secondary" className="shrink-0 mt-0.5">
                        {idx + 1}
                      </Badge>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audio Discussion</CardTitle>
              <CardDescription>
                Expert conversation about the paper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <audio
                ref={audioRef}
                src={audioUrl || undefined}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <div className="flex flex-wrap gap-2 mb-4">
                {discussion.speakers.map((speaker) => (
                  <Badge key={speaker.name} variant="outline" className="gap-1">
                    {getRoleIcon(speaker.role)}
                    {speaker.name}
                  </Badge>
                ))}
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {discussion.discussion.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        turn.role === 'skeptic' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${getRoleColor(turn.role)}`}
                      >
                        {getRoleIcon(turn.role)}
                      </div>
                      <div
                        className={`flex-1 rounded-lg p-3 max-w-[80%] ${
                          turn.role === 'skeptic'
                            ? 'bg-orange-100 dark:bg-orange-950/20'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{turn.speaker}</span>
                          <Badge variant="outline" className="text-xs">
                            {turn.role}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed">{turn.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-center gap-3 pt-4 border-t">
                <Button
                  size="lg"
                  onClick={handlePlay}
                  disabled={isAudioLoading}
                  className="gap-2"
                >
                  <Play className="h-5 w-5" />
                  {isAudioLoading ? 'Generating…' : isPlaying ? 'Playing…' : 'Play Audio'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePause}
                  disabled={!audioUrl || isAudioLoading}
                  className="gap-2"
                >
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
              </div>
              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
