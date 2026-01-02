'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Layout, Volume2, Network, CheckCircle2, Circle } from 'lucide-react'

interface ProgressTrackerProps {
  totalSections: number
  completedSections: number
  questionsAnswered: number
  totalQuestions: number
  viewedSlides: boolean
  viewedAudio: boolean
  viewedMindmap: boolean
  gradeLevel: number
  interest: string
}

export function ProgressTracker({
  totalSections,
  completedSections,
  questionsAnswered,
  totalQuestions,
  viewedSlides,
  viewedAudio,
  viewedMindmap,
  gradeLevel,
  interest,
}: ProgressTrackerProps) {
  const sectionProgress = (completedSections / totalSections) * 100
  const questionProgress = totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0
  const viewsViewed = [viewedSlides, viewedAudio, viewedMindmap].filter(Boolean).length
  const totalViews = 3
  const viewsProgress = (viewsViewed / totalViews) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Sections Completed
            </span>
            <span className="font-medium">
              {completedSections} / {totalSections}
            </span>
          </div>
          <Progress value={sectionProgress} className="h-2" />
        </div>

        {/* Questions Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              Questions Answered
            </span>
            <span className="font-medium">
              {questionsAnswered} / {totalQuestions}
            </span>
          </div>
          <Progress value={questionProgress} className="h-2" />
        </div>

        {/* Learning Views Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Learning Views Explored</span>
            <span className="font-medium">
              {viewsViewed} / {totalViews}
            </span>
          </div>
          <Progress value={viewsProgress} className="h-2" />
        </div>

        {/* Views Status */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
              viewedSlides
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-muted bg-muted/50'
            }`}
          >
            <Layout
              className={`h-5 w-5 ${viewedSlides ? 'text-green-600' : 'text-muted-foreground'}`}
            />
            <span className="text-xs mt-1">Slides</span>
            {viewedSlides && (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            )}
          </div>

          <div
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
              viewedAudio
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-muted bg-muted/50'
            }`}
          >
            <Volume2
              className={`h-5 w-5 ${viewedAudio ? 'text-green-600' : 'text-muted-foreground'}`}
            />
            <span className="text-xs mt-1">Audio</span>
            {viewedAudio && (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            )}
          </div>

          <div
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
              viewedMindmap
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-muted bg-muted/50'
            }`}
          >
            <Network
              className={`h-5 w-5 ${viewedMindmap ? 'text-green-600' : 'text-muted-foreground'}`}
            />
            <span className="text-xs mt-1">Mind Map</span>
            {viewedMindmap && (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            )}
          </div>
        </div>

        {/* Preferences Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Learning Preferences</span>
            <div className="flex gap-2">
              <Badge variant="outline">Grade {gradeLevel}</Badge>
              <Badge variant="outline">{interest}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
