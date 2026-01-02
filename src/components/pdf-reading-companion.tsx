'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Upload, Link as LinkIcon, FileText, BrainCircuit, MessageSquare, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface Question {
  id: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Concept {
  id: string
  term: string
  definition: string
  importance: 'high' | 'medium' | 'low'
}

interface AnalysisResult {
  summary: string
  keyConcepts: Concept[]
  questions: Question[]
  sections: Array<{ title: string; content: string }>
}

export function PDFReadingCompanion() {
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('overview')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else if (selectedFile) {
      setError('Please upload a PDF file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze PDF')
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (err) {
      setError('Failed to analyze PDF. Please try again.')
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!url) {
      setError('Please enter a PDF URL')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze PDF')
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (err) {
      setError('Failed to analyze PDF. Please try again.')
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">PDF Reading Companion</h1>
        <p className="text-muted-foreground">
          Upload a PDF or provide a URL to get AI-powered analysis, key concepts, and guided questions
        </p>
      </div>

      {!analysis ? (
        <Card>
          <CardHeader>
            <CardTitle>Import Your PDF</CardTitle>
            <CardDescription>
              Choose how you'd like to add your PDF document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={inputType} onValueChange={(v) => setInputType(v as 'upload' | 'url')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Enter URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 mt-6">
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF files only</p>
                    </div>
                    {file && (
                      <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">{file.name}</span>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label htmlFor="pdf-url" className="text-sm font-medium">
                    PDF URL
                  </label>
                  <Input
                    id="pdf-url"
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the direct URL to a PDF file
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={inputType === 'upload' ? handleUpload : handleUrlSubmit}
                disabled={
                  isAnalyzing ||
                  (inputType === 'upload' && !file) ||
                  (inputType === 'url' && !url)
                }
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4" />
                    Analyze PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">Analysis Complete</Badge>
              <h2 className="text-2xl font-bold">Your PDF Analysis</h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const sourceName = file?.name || url || 'PDF'
                  const materialTitle = sourceName.replace(/\.pdf$/i, '').trim() || 'PDF'

                  localStorage.setItem(
                    'learnMyWay.session',
                    JSON.stringify({
                      materialTitle,
                      category: 'PDF',
                      sections: analysis.sections,
                    })
                  )

                  window.location.href = '/learning'
                }}
              >
                Start Learning
              </Button>
              <Button variant="outline" onClick={() => setAnalysis(null)}>
                Analyze Another PDF
              </Button>
            </div>
          </div>

          <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList>
                <TabsTrigger value="overview" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="concepts" className="gap-2">
                  <BrainCircuit className="h-4 w-4" />
                  Key Concepts
                </TabsTrigger>
                <TabsTrigger value="questions" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Questions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {analysis.summary}
                  </p>
                </CardContent>
              </Card>

              {analysis.sections && analysis.sections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Document Sections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4 pr-4">
                        {analysis.sections.map((section, idx) => (
                          <div key={idx} className="space-y-2">
                            <h4 className="font-semibold text-lg">{section.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {section.content}
                            </p>
                            {idx < analysis.sections.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="concepts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Concepts ({analysis.keyConcepts.length})</CardTitle>
                  <CardDescription>
                    Important terms and ideas from the document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {analysis.keyConcepts.map((concept) => (
                      <Card
                        key={concept.id}
                        className={`border-2 ${
                          concept.importance === 'high'
                            ? 'border-primary'
                            : concept.importance === 'medium'
                            ? 'border-primary/30'
                            : 'border-muted'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{concept.term}</CardTitle>
                            <Badge
                              variant={
                                concept.importance === 'high'
                                  ? 'default'
                                  : concept.importance === 'medium'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {concept.importance}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {concept.definition}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Guided Questions ({analysis.questions.length})</CardTitle>
                  <CardDescription>
                    Questions to test your understanding and guide your reading
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                      {analysis.questions.map((question) => (
                        <Card key={question.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{question.question}</CardTitle>
                              <Badge
                                variant={
                                  question.difficulty === 'hard'
                                    ? 'destructive'
                                    : question.difficulty === 'medium'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {question.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <details className="group">
                              <summary className="cursor-pointer text-sm text-primary font-medium hover:underline list-none">
                                Show Answer
                              </summary>
                              <div className="mt-3 p-3 bg-muted rounded-md">
                                <p className="text-sm">{question.answer}</p>
                              </div>
                            </details>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
