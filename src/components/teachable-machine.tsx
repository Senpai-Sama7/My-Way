'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Brain, Zap, Target, Lightbulb, ArrowRight, Play } from 'lucide-react'

const steps = [
  {
    number: 1,
    title: 'Gather Your Data',
    description: 'Collect images or sounds that you want your machine to recognize. For example, gather photos of different plants for a plant classifier.',
    icon: <Target className="h-5 w-5" />,
  },
  {
    number: 2,
    title: 'Train Your Model',
    description: 'Upload your data to Teachable Machine and train your model by adding examples to each class. The system learns patterns automatically.',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    number: 3,
    title: 'Test & Refine',
    description: 'Test your model with new examples and refine it by adding more training data. Improve accuracy through iteration.',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    number: 4,
    title: 'Export & Use',
    description: 'Export your trained model to use in your own projects, or share it with others.',
    icon: <Lightbulb className="h-5 w-5" />,
  },
]

const projectIdeas = [
  {
    title: 'Plant Species Identifier',
    category: 'Science',
    difficulty: 'Easy',
    description: 'Train a model to recognize different plant species from your garden or local park.',
    steps: ['Collect photos of various plants', 'Create classes for each species', 'Train with 20+ images per class'],
  },
  {
    title: 'Emotion Detector',
    category: 'Psychology',
    difficulty: 'Medium',
    description: 'Create a simple emotion recognition system using facial expressions.',
    steps: ['Gather facial expression photos', 'Label emotions: happy, sad, angry, etc.', 'Train and test with friends'],
  },
  {
    title: 'Sound Classifier',
    category: 'Music',
    difficulty: 'Easy',
    description: 'Identify different musical instruments or environmental sounds.',
    steps: ['Record sound samples', 'Create instrument categories', 'Train with varied recordings'],
  },
  {
    title: 'Hand Gesture Control',
    category: 'Technology',
    difficulty: 'Hard',
    description: 'Control your computer with hand gestures using a webcam.',
    steps: ['Record hand gestures', 'Map to computer actions', 'Export to use with applications'],
  },
]

export function TeachableMachine() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Teachable Machine</h1>
        <p className="text-muted-foreground">
          A fast, easy way to create machine learning models – no coding required
        </p>
        <Badge className="mt-2" variant="secondary">
          <ExternalLink className="h-3 w-3 mr-1" />
          By Google Creative Lab
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            What is Teachable Machine?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            Teachable Machine lets you teach your computer to recognize your own images, sounds, and poses without writing any code.
            It uses web-based transfer learning to create custom AI models that you can use in your own projects.
            Perfect for students, educators, and beginners who want to understand how machine learning works.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Four simple steps to create your model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <span className="text-primary">{step.icon}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Use Teachable Machine?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'No coding or programming knowledge required',
                'Free and runs entirely in your browser',
                'Learn machine learning concepts hands-on',
                'Export models to use in web, mobile, or Arduino projects',
                'Great for STEM education and experimentation',
                'Share your models with others easily',
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Ideas</CardTitle>
          <CardDescription>Get inspired with these starter projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {projectIdeas.map((project, idx) => (
              <Card key={idx} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <Badge variant="outline">{project.difficulty}</Badge>
                  </div>
                  <CardDescription className="text-xs">{project.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description}
                  </p>
                  <div className="space-y-1">
                    {project.steps.slice(0, 3).map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Visit Teachable Machine to create your first model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="flex-1"
              size="lg"
            >
              <a
                href="https://teachablemachine.withgoogle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <Play className="h-5 w-5" />
                Launch Teachable Machine
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <a
                href="https://github.com/googlecreativelab/teachable-machine"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                View Documentation
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Teachable Machine is an external tool by Google Creative Lab. You'll be redirected to their website to create your models.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
