'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PDFReadingCompanion,
} from '@/components/pdf-reading-companion'
import {
  AudioDiscussionGenerator,
} from '@/components/audio-discussion-generator'
import { TeachableMachine } from '@/components/teachable-machine'
import { LearningExperiments } from '@/components/learning-experiments'
import { BookOpen, Volume2, Brain, Beaker, ArrowLeft } from 'lucide-react'

type Tool = 'home' | 'pdf-companion' | 'audio-discussion' | 'teachable-machine' | 'experiments'

const tools = [
  {
    id: 'pdf-companion' as Tool,
    title: 'PDF Reading Companion',
    description: 'Upload or link a PDF to get AI-powered analysis, key concepts, and guided questions',
    icon: <BookOpen className="h-6 w-6" />,
    category: 'Analysis',
    features: ['Extract key concepts', 'Generate guided questions', 'Section summaries', 'Document analysis'],
  },
  {
    id: 'audio-discussion' as Tool,
    title: 'Academic Paper to Audio',
    description: 'Transform academic papers into engaging audio discussions between experts',
    icon: <Volume2 className="h-6 w-6" />,
    category: 'Audio',
    features: ['Expert conversations', 'Key points extraction', 'Paper summaries', 'Accessible learning'],
  },
  {
    id: 'teachable-machine' as Tool,
    title: 'Teachable Machine',
    description: 'Create machine learning models without coding using Google Creative Lab',
    icon: <Brain className="h-6 w-6" />,
    category: 'ML Tools',
    features: ['No coding required', 'Image/audio models', 'Easy training', 'Export ready'],
  },
  {
    id: 'experiments' as Tool,
    title: 'Learning Experiments',
    description: 'Hands-on experiments for classroom and home learning',
    icon: <Beaker className="h-6 w-6" />,
    category: 'Activities',
    features: ['Science projects', 'Math games', 'Art activities', 'Social skills'],
  },
]

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<Tool>('home')

  return (
    <div className="space-y-6">
      {selectedTool === 'home' && (
        <div className="space-y-6">
          <div>
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold mb-2">AI Learning Tools</h1>
            <p className="text-muted-foreground">
              Explore our collection of AI-powered educational tools and resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                onClick={() => setSelectedTool(tool.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {tool.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{tool.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTool === 'pdf-companion' && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedTool('home')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
          <PDFReadingCompanion />
        </div>
      )}

      {selectedTool === 'audio-discussion' && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedTool('home')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
          <AudioDiscussionGenerator />
        </div>
      )}

      {selectedTool === 'teachable-machine' && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedTool('home')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
          <TeachableMachine />
        </div>
      )}

      {selectedTool === 'experiments' && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedTool('home')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
          <LearningExperiments />
        </div>
      )}
    </div>
  )
}
