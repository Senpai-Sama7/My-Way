'use client'

import { useEffect, useMemo, useState } from 'react'
import { LearningView } from '@/components/learning-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type StoredLearningSession = {
  materialTitle: string
  category?: string
  sections: Array<{ title: string; content: string }>
}

function getStoredSession(): StoredLearningSession | null {
  try {
    const raw = localStorage.getItem('learnMyWay.session')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.materialTitle || !Array.isArray(parsed?.sections)) return null
    return parsed
  } catch {
    return null
  }
}

export default function LearningPage() {
  const [session, setSession] = useState<StoredLearningSession | null>(null)
  const [gradeLevel, setGradeLevel] = useState<number>(8)
  const [interest, setInterest] = useState<string>('')

  useEffect(() => {
    const s = getStoredSession()
    setSession(s)

    try {
      const prefsRaw = localStorage.getItem('userPreferences')
      if (prefsRaw) {
        const prefs = JSON.parse(prefsRaw)
        if (typeof prefs?.gradeLevel === 'number') setGradeLevel(prefs.gradeLevel)
        if (typeof prefs?.interest === 'string') setInterest(prefs.interest)
      }
    } catch {
      // ignore
    }
  }, [])

  const sections = useMemo(() => {
    if (!session) return []
    return session.sections.map((s, idx) => ({
      id: idx,
      title: s.title,
      content: s.content,
    }))
  }, [session])

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>No learning session found</CardTitle>
            <CardDescription>
              Start by analyzing a PDF in Tools → PDF Reading Companion, then click “Start Learning”.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => (window.location.href = '/tools')}>Go to Tools</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="container mx-auto px-4 pt-6 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Session Settings</CardTitle>
            <CardDescription>
              These settings are used when generating slides, mind maps, audio lessons, and quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="gradeLevel">Grade level</label>
              <Input
                id="gradeLevel"
                type="number"
                min={6}
                max={13}
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="interest">Interest (optional)</label>
              <Input
                id="interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="e.g., sports, music, gaming"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <LearningView
        materialTitle={session.materialTitle}
        category={session.category || 'Imported'}
        gradeLevel={gradeLevel}
        interest={interest}
        sections={sections}
      />
    </div>
  )
}

