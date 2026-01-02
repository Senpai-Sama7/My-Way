'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, BrainCircuit, ArrowRight, BookOpen, Volume2, Layout, Network, Sparkles } from 'lucide-react'

const gradeLevels = [
  { value: 6, label: '6th Grade' },
  { value: 7, label: '7th Grade' },
  { value: 8, label: '8th Grade' },
  { value: 9, label: '9th Grade (Freshman)' },
  { value: 10, label: '10th Grade (Sophomore)' },
  { value: 11, label: '11th Grade (Junior)' },
  { value: 12, label: '12th Grade (Senior)' },
  { value: 13, label: 'Undergraduate' },
]

const interests = [
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'food', label: 'Food & Cooking', icon: '🍳' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'art', label: 'Art & Design', icon: '🎨' },
  { value: 'science', label: 'Science', icon: '🔬' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
]

const materials = [
  {
    id: '1',
    title: 'Newton\'s Third Law of Motion',
    category: 'Physics',
    description: 'Explore the fundamental principles of forces and motion in physics',
  },
  {
    id: '2',
    title: 'How To Organize Economies',
    category: 'Economics',
    description: 'Learn about different economic systems and how they function',
  },
  {
    id: '3',
    title: 'Early Human Evolution and Migration',
    category: 'History',
    description: 'Discover the journey of early humans across the globe',
  },
]

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'onboarding' | 'material'>('welcome')
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)

  const handleStart = () => {
    setStep('onboarding')
  }

  const handleContinue = () => {
    if (step === 'onboarding' && selectedGrade && selectedInterest) {
      setStep('material')
    }
  }

  const handleStartLearning = () => {
    if (selectedMaterial) {
      // Save preferences and redirect to learning view
      localStorage.setItem('userPreferences', JSON.stringify({
        gradeLevel: selectedGrade,
        interest: selectedInterest,
        materialId: selectedMaterial,
      }))
      // Redirect to learning page
      window.location.href = '/learning'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {step === 'welcome' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <BrainCircuit className="h-20 w-20 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Learn Your Way
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your learning experience with AI-powered personalization and multiple representations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 my-8">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Immersive Text</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Personalized content with embedded questions and interactive elements
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Volume2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Audio Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Conversational audio lessons with visual representations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Network className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Mind Maps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Visual organization of concepts with interactive navigation
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleStart} className="gap-2 flex-1 sm:flex-none">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/learn'} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Learn Anything
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/tools'} className="gap-2">
              <BookOpen className="h-4 w-4" />
              Explore AI Tools
            </Button>
          </div>
        </div>
      )}

      {step === 'onboarding' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Personalize Your Experience</h2>
            <p className="text-muted-foreground">
              Select your grade level and interests to customize the learning content
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Your Grade Level</CardTitle>
              <CardDescription>
                Choose the grade level that matches your reading comprehension
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {gradeLevels.map((level) => (
                  <Button
                    key={level.value}
                    variant={selectedGrade === level.value ? 'default' : 'outline'}
                    onClick={() => setSelectedGrade(level.value)}
                    className="h-auto py-4"
                  >
                    <span className="flex flex-col items-center gap-1">
                      <span className="font-semibold">{level.value}</span>
                      <span className="text-xs opacity-80">{level.label.split(' ')[0]}</span>
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Your Interests</CardTitle>
              <CardDescription>
                Choose topics you're interested in to personalize examples and explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {interests.map((interest) => (
                  <Button
                    key={interest.value}
                    variant={selectedInterest === interest.value ? 'default' : 'outline'}
                    onClick={() => setSelectedInterest(interest.value)}
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <span className="text-2xl">{interest.icon}</span>
                    <span className="text-sm">{interest.label}</span>
                    {selectedInterest === interest.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setStep('welcome')}>
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedGrade || !selectedInterest}
              className="gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 'material' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Choose Your Learning Material</h2>
            <p className="text-muted-foreground">
              Select a textbook chapter to begin your personalized learning journey
            </p>
            <div className="flex justify-center gap-2 flex-wrap mt-4">
              <Badge variant="secondary">Grade: {selectedGrade}</Badge>
              <Badge variant="secondary">Interest: {interests.find(i => i.value === selectedInterest)?.label}</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {materials.map((material) => (
              <Card
                key={material.id}
                className={`cursor-pointer transition-all ${
                  selectedMaterial === material.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:ring-1 hover:ring-primary'
                }`}
                onClick={() => setSelectedMaterial(material.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {selectedMaterial === material.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                        {material.title}
                      </CardTitle>
                      <CardDescription>{material.category}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {material.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setStep('onboarding')}>
              Back
            </Button>
            <Button
              onClick={handleStartLearning}
              disabled={!selectedMaterial}
              size="lg"
              className="gap-2"
            >
              Start Learning
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
