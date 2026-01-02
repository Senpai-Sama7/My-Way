'use client'

import { Fragment, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, BrainCircuit, Loader2 } from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuizResult {
  questionId: string
  userAnswer: number | null
  correctAnswer: number
  isCorrect: boolean
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuizFeedback {
  score: number
  correctCount: number
  totalCount: number
  glow: string
  grows: string
  nextSteps: string
  feedback: string
}

interface SectionQuizProps {
  title: string
  questions: QuizQuestion[]
  onComplete: (result: QuizFeedback, detailedResults: QuizResult[]) => void
  onClose: () => void
  ariaLabel?: string
}

export function SectionQuiz({ title, questions, onComplete, onClose, ariaLabel = 'Section Quiz' }: SectionQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<QuizFeedback | null>(null)
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})

  if (!questions || questions.length === 0) {
    return (
      <div role="dialog" aria-modal="true" aria-label={ariaLabel} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>No quiz questions available</CardTitle>
            <CardDescription>
              Generate a quiz and try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
    // Announce to screen readers
    announceToScreenReader(`Selected option ${['A', 'B', 'C', 'D'][answerIndex]} for question`)
  }

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => prev + 1)
    announceToScreenReader('Moving to next question')
    // Focus first option
    setTimeout(() => {
      const firstOption = document.querySelector('[role="option"][tabindex="0"]') as HTMLElement
      firstOption?.focus()
    }, 100)
  }

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => prev - 1)
    announceToScreenReader('Moving to previous question')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    announceToScreenReader('Submitting quiz...')

    try {
      const response = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          questions: questions.map((q) => ({
            id: q.id,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty,
            explanation: q.explanation,
          })),
          answers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const data = await response.json()
      setResult(data)
      setShowResults(true)

      const detailedResults: QuizResult[] = questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id]!,
        correctAnswer: q.correctAnswer,
        isCorrect: answers[q.id] === q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }))

      onComplete(data, detailedResults)
      announceToScreenReader(`Quiz submitted. You scored ${data.score}%.`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      announceToScreenReader('Failed to submit quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowExplanation({})
    setShowResults(false)
    setResult(null)
    announceToScreenReader('Quiz reset. Starting from question 1.')
  }

  const toggleExplanation = (questionId: string) => {
    const newState = !showExplanation[questionId]
    setShowExplanation((prev) => ({
      ...prev,
      [questionId]: newState,
    }))
    announceToScreenReader(newState ? 'Explanation shown' : 'Explanation hidden')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDifficultyAria = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy difficulty question'
      case 'medium': return 'Medium difficulty question'
      case 'hard': return 'Hard difficulty question'
      default: return 'Question'
    }
  }

  // Screen reader announcement helper
  const announceToScreenReader = (message: string) => {
    // Create a temporary element to announce
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('role', 'status')
    announcement.textContent = message
    announcement.className = 'sr-only'
    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / totalQuestions) * 100
  const currentQuestion = questions[currentQuestionIndex]
  const isCurrentAnswered = currentQuestion ? currentQuestion.id in answers : false
  const isLastQuestion = currentQuestionIndex >= questions.length - 1

  if (showResults && result) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-results-title"
        className="space-y-6 animate-in fade-in"
      >
        {/* Score Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardHeader className="text-center">
            <h2 id="quiz-results-title" className="text-2xl font-bold">
              Quiz Results: {result.score}% - {result.score >= 70 ? 'Passed' : 'Needs Review'}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Correct</p>
                <p className="text-3xl font-bold text-green-600">
                  {result.correctCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-muted-foreground">
                  {result.totalCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}%
                </p>
              </div>
            </div>

            <Progress value={result.score} aria-label={`Quiz score: ${result.score}%`} className="h-3" />
          </CardContent>
        </Card>

        {/* Glow Card */}
        <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <h3 className="flex items-center gap-2">
              <span className="text-xl text-green-900 dark:text-green-100">✓</span>
              <CardTitle className="text-xl text-green-900 dark:text-green-100">
                Glow (Strengths)
              </CardTitle>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{result.glow}</p>
          </CardContent>
        </Card>

        {/* Grows Card */}
        <Card className="border-orange-500/30 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <h3 className="flex items-center gap-2">
              <span className="text-xl text-orange-600 dark:text-orange-400">→</span>
              <CardTitle className="text-xl text-orange-900 dark:text-orange-100">
                Grows (Areas for Improvement)
              </CardTitle>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{result.grows}</p>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{result.nextSteps}</p>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
            <CardDescription>
              Review your answers for each question
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, idx) => {
                const userAnswer = answers[question.id]
                const isCorrect = userAnswer === question.correctAnswer

                return (
                  <Fragment key={question.id}>
                    <div
                      className={`border-l-4 pl-4 py-3 rounded-lg ${
                        isCorrect
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-500/30'
                          : 'bg-red-50 dark:bg-red-950/20 border-red-500/30'
                      }`}
                      role="listitem"
                      aria-label={`Question ${idx + 1}. ${isCorrect ? 'Correct' : 'Incorrect'}`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            Q{idx + 1}. {getDifficultyAria(question.difficulty)}
                          </p>
                          <p className="text-base leading-relaxed">{question.question}</p>
                        </div>
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="font-medium text-sm mb-2">
                        Your answer:{' '}
                        {typeof userAnswer === 'number' ? ['A', 'B', 'C', 'D'][userAnswer] : '—'}
                      </p>

                      {showExplanation[question.id] && (
                        <div
                          className="p-3 bg-muted/50 rounded-lg border"
                          role="region"
                          aria-label={`Explanation for question ${idx + 1}`}
                        >
                          <p className="text-sm">
                            <strong className="text-primary">Correct Answer:</strong>{' '}
                            {question.options[question.correctAnswer]}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </Fragment>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="gap-2"
            aria-label="Retry quiz"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Quiz
          </Button>
          <Button
            onClick={onClose}
            className="gap-2"
            aria-label="Continue learning"
          >
            <ArrowRight className="h-4 w-4" />
            Continue Learning
          </Button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="space-y-4" aria-label={ariaLabel}>
        <p className="text-muted-foreground">No quiz questions available.</p>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6" aria-label={ariaLabel}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">
            Test your understanding of this material
          </p>
        </div>
        <Button variant="outline" onClick={onClose} aria-label="Close quiz">
          Close
        </Button>
      </div>

      {/* Progress */}
      <div
        role="region"
        aria-live="polite"
        className="space-y-2"
      >
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Quiz Progress</span>
          <span aria-live="polite">
            {answeredCount} of {totalQuestions} questions answered
          </span>
        </div>
        <Progress value={progress} aria-label={`Quiz progress: ${progress}%`} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <Badge
                variant="outline"
                className="gap-1"
                aria-label={getDifficultyAria(currentQuestion.difficulty)}
              >
                <span className={`w-2 h-2 rounded-full ${getDifficultyColor(currentQuestion.difficulty)}`} aria-hidden="true" />
                <span className="sr-only">{currentQuestion.difficulty}</span>
                {currentQuestion.difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed mb-4">{currentQuestion.question}</p>

          <div className="space-y-3" role="radiogroup" aria-label={`Options for question ${currentQuestionIndex + 1}`}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === idx
              const userHasAnswered = currentQuestion.id in answers

              return (
                <button
                  key={idx}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Option ${['A', 'B', 'C', 'D'][idx]}: ${option}`}
                  onClick={() => !userHasAnswered && handleAnswerSelect(currentQuestion.id, idx)}
                  disabled={userHasAnswered}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-[1.02] ring-2 ring-primary ring-offset-2'
                      : 'border-muted hover:border-primary/50 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary'
                  }`}
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground" aria-hidden="true">
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span className="text-sm">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation Toggle */}
          {isCurrentAnswered && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => toggleExplanation(currentQuestion.id)}
                variant="outline"
                aria-expanded={!!showExplanation[currentQuestion.id]}
                aria-controls={`explanation-${currentQuestion.id}`}
                aria-label={showExplanation[currentQuestion.id] ? 'Hide answer explanation' : 'Show answer explanation'}
                className="flex-1"
              >
                {showExplanation[currentQuestion.id] ? 'Hide Explanation' : 'Show Explanation'}
              </Button>
            </div>
          )}

          {/* Explanation */}
          {showExplanation[currentQuestion.id] && (
            <div
              id={`explanation-${currentQuestion.id}`}
              role="region"
              aria-label={`Explanation for question ${currentQuestionIndex + 1}`}
              className="mt-4 p-4 bg-primary/5 border-primary/20 rounded-lg"
            >
              <p className="text-sm">
                <strong className="text-primary">Correct Answer: </strong>
                {currentQuestion.options[currentQuestion.correctAnswer]}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          aria-label="Go to previous question"
          className="gap-2"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {!isLastQuestion ? (
            <Button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              aria-label={!isCurrentAnswered ? 'Answer this question to continue' : 'Go to next question'}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < totalQuestions || isSubmitting}
              aria-label={answeredCount < totalQuestions ? 'Cannot submit yet. Answer all questions first.' : 'Submit quiz'}
              className="gap-2 min-w-[180px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span aria-hidden="true">Submitting...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="h-4 w-4" aria-hidden="true" />
                  Submit Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Hints */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p className="font-semibold mb-2">Keyboard Shortcuts:</p>
        <ul className="grid grid-cols-2 gap-2" role="list">
          <li>
            <kbd className="px-2 py-1 bg-background border rounded text-xs">↑</kbd> Previous question
          </li>
          <li>
            <kbd className="px-2 py-1 bg-background border rounded text-xs">↓</kbd> Next question
          </li>
          <li>
            <kbd className="px-2 py-1 bg-background border rounded text-xs">Enter</kbd> Select option / Confirm
          </li>
          <li>
            <kbd className="px-2 py-1 bg-background border rounded text-xs">1-4</kbd> Select option directly
          </li>
          <li>
            <kbd className="px-2 py-1 bg-background border rounded text-xs">Escape</kbd> Close quiz
          </li>
        </ul>
      </div>
    </div>
  )
}
