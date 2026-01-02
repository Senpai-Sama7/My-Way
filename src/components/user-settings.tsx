'use client'

import { Fragment, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  User,
  BookMarked,
  Target,
  Clock,
  BarChart3,
  Brain,
  Eye,
  Ear,
  Activity,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

interface LearningPreferences {
  gradeLevel: number
  interest: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  dailyGoal: number
}

interface MaterialProgress {
  materialId: string
  title: string
  category: string
  progress: number
  lastAccessed: string
  currentView: string
}

const learningStyles = [
  {
    value: 'visual',
    label: 'Visual Learner',
    description: 'Learn best through diagrams, charts, and visual representations',
    icon: <Eye className="h-5 w-5" />,
  },
  {
    value: 'auditory',
    label: 'Auditory Learner',
    description: 'Prefer listening to explanations and discussions',
    icon: <Ear className="h-5 w-5" />,
  },
  {
    value: 'kinesthetic',
    label: 'Kinesthetic Learner',
    description: 'Learn by doing - hands-on activities and practice',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    value: 'reading',
    label: 'Reading Learner',
    description: 'Prefer reading text and written explanations',
    icon: <BookMarked className="h-5 w-5" />,
  },
]

export function UserSettings() {
  const [activeTab, setActiveTab] = useState<'preferences' | 'progress' | 'history'>('preferences')
  const [preferences, setPreferences] = useState<LearningPreferences>({
    gradeLevel: 8,
    interest: '',
    learningStyle: 'reading',
    dailyGoal: 30,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [progressData, setProgressData] = useState<MaterialProgress[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load preferences and progress on mount
  useEffect(() => {
    loadPreferences()
    loadProgress()
  }, [])

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-preferences' }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.preferences) {
          setPreferences(data.preferences)
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }

  const loadProgress = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-all-progress' }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.progress) {
          setProgressData(data.progress)
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-preferences',
          ...preferences,
        }),
      })

      if (response.ok) {
        setSaveMessage('Preferences saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Failed to save preferences')
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setSaveMessage('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setPreferences({
      gradeLevel: 8,
      interest: '',
      learningStyle: 'reading',
      dailyGoal: 30,
    })
    setSaveMessage('')
  }

  const getDifficultyLabel = (level: number) => {
    if (level <= 6) return 'Beginner'
    if (level <= 8) return 'Intermediate'
    if (level <= 10) return 'Advanced'
    return 'Expert'
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const handleRefreshProgress = () => {
    loadProgress()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => window.location.href = '/'} className="gap-2">
          ← Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Settings & Progress</h1>
        <p className="text-muted-foreground">
          Manage your learning preferences and track your progress
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="preferences" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>
                Customize your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Grade Level */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Grade Level</label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[preferences.gradeLevel]}
                    onValueChange={(v) => setPreferences((prev) => ({ ...prev, gradeLevel: v[0] }))}
                    min={6}
                    max={13}
                    step={1}
                    className="flex-1"
                    aria-label={`Grade level: ${preferences.gradeLevel}`}
                  />
                  <Badge variant="outline" className="shrink-0" aria-label={getDifficultyLabel(preferences.gradeLevel)}>
                    {preferences.gradeLevel} - {getDifficultyLabel(preferences.gradeLevel)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adjusts content complexity and examples (6th Grade - Undergraduate)
                </p>
              </div>

              <Separator />

              {/* Interest */}
              <div className="space-y-3">
                <label htmlFor="interest" className="text-sm font-medium">Your Interest</label>
                <Input
                  id="interest"
                  type="text"
                  placeholder="e.g., sports, music, gaming, cooking..."
                  value={preferences.interest}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, interest: e.target.value }))}
                  aria-label="Your learning interest"
                />
                <p className="text-xs text-muted-foreground">
                  Personalizes examples and analogies
                </p>
              </div>

              <Separator />

              {/* Learning Style */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Learning Style</label>
                <div className="grid grid-cols-2 gap-4">
                  {learningStyles.map((style) => (
                    <Button
                      key={style.value}
                      variant={preferences.learningStyle === style.value ? 'default' : 'outline'}
                      onClick={() => setPreferences((prev) => ({ ...prev, learningStyle: style.value as any }))}
                      className="h-auto py-6 flex-col gap-2"
                      aria-label={`Learning style: ${style.label}`}
                    >
                      {style.icon}
                      <span className="font-medium">{style.label}</span>
                      <span className="text-xs text-muted-foreground text-left leading-tight">
                        {style.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Daily Goal */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Daily Learning Goal (minutes)</label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[preferences.dailyGoal]}
                    onValueChange={(v) => setPreferences((prev) => ({ ...prev, dailyGoal: v[0] }))}
                    min={5}
                    max={120}
                    step={5}
                    className="flex-1"
                    aria-label={`Daily learning goal: ${preferences.dailyGoal} minutes`}
                  />
                  <Badge variant="secondary" className="shrink-0" aria-label={`${preferences.dailyGoal} minutes`}>
                    {preferences.dailyGoal} min
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set your daily learning target to track progress and stay motivated
                </p>
              </div>

              {/* Save Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                {saveMessage && (
                  <div className={`text-sm ${
                    saveMessage.includes('success') ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {saveMessage}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleReset} aria-label="Reset to default preferences">
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="gap-2"
                    aria-label="Save preferences"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Progress</CardTitle>
                  <CardDescription>
                    Track your learning journey across different materials
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshProgress}
                  disabled={isLoading}
                  aria-label="Refresh progress"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {progressData.length > 0 ? (
                    <ScrollArea className="h-96 pr-4">
                      <div className="space-y-4">
                        {progressData.map((item, idx) => (
                          <Fragment key={item.materialId}>
                            <Card className="border">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                    <Badge variant="outline">{item.category}</Badge>
                                  </div>
                                  <Badge variant="secondary">{item.currentView}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-semibold">{item.progress}%</span>
                                </div>
                                <Progress value={item.progress} className="h-2" aria-label={`Progress for ${item.title}: ${item.progress}%`} />
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>Last accessed</span>
                                  <span>{new Date(item.lastAccessed).toLocaleDateString()}</span>
                                </div>
                              </CardContent>
                            </Card>
                            {idx < progressData.length - 1 && <Separator className="my-4" />}
                          </Fragment>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No progress data yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start learning to track your progress
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Overview */}
          {progressData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Overall Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {progressData.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Materials Started</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(
                        progressData.reduce((acc, item) => acc + item.progress, 0) / progressData.length
                      )}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground">Avg. Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {progressData.filter(item => item.progress >= 80).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
