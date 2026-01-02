'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Search, Clock, Users, Home, GraduationCap, Beaker, Palette, BookOpen, FlaskConical, Target, Heart, Eye, Lightbulb } from 'lucide-react'

type Category = 'all' | 'science' | 'art' | 'math' | 'language' | 'social'

interface Experiment {
  id: string
  title: string
  category: string
  ageRange: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  environment: 'home' | 'classroom' | 'both'
  description: string
  materials: string[]
  steps: string[]
  learningOutcome: string
  icon: React.ReactNode
}

const experiments: Experiment[] = [
  {
    id: 'exp-1',
    title: 'Water Density Tower',
    category: 'science',
    ageRange: '8-12',
    duration: '15-20 min',
    difficulty: 'easy',
    environment: 'both',
    description: 'Create a colorful tower of liquids to learn about density in a visually stunning way.',
    materials: ['Clear glass or jar', 'Water', 'Honey', 'Vegetable oil', 'Dish soap', 'Food coloring'],
    steps: [
      'Pour honey into the bottom of the jar',
      'Carefully add dish soap on top',
      'Add water colored with food coloring',
      'Finally, pour vegetable oil on top',
      'Observe how the liquids form layers',
    ],
    learningOutcome: 'Understand density - how mass and volume affect whether objects float or sink.',
    icon: <FlaskConical className="h-5 w-5" />,
  },
  {
    id: 'exp-2',
    title: 'Fraction Pizza',
    category: 'math',
    ageRange: '6-10',
    duration: '20-30 min',
    difficulty: 'easy',
    environment: 'home',
    description: 'Learn fractions by dividing and sharing a delicious pizza with friends.',
    materials: ['Paper or real pizza', 'Markers or toppings', 'Plate', 'Knife (adult supervision)'],
    steps: [
      'Draw or prepare a pizza divided into equal slices',
      'Practice naming fractions (1/2, 1/4, 1/8)',
      'Remove pieces and name remaining fractions',
      'Add pieces back and calculate total',
      'Try different starting numbers of slices',
    ],
    learningOutcome: 'Visualize and understand basic fractions through hands-on manipulation.',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'exp-3',
    title: 'Color Mixing Magic',
    category: 'art',
    ageRange: '4-8',
    duration: '10-15 min',
    difficulty: 'easy',
    environment: 'home',
    description: 'Discover primary and secondary colors by mixing paints in fun ways.',
    materials: ['Red, yellow, blue paint', 'Paper plates', 'Paintbrushes', 'Water cup', 'Paper'],
    steps: [
      'Start with three primary colors on separate plates',
      'Mix red and yellow - what color do you get?',
      'Mix yellow and blue - observe the result',
      'Mix blue and red - note the new color',
      'Try mixing all three together',
    ],
    learningOutcome: 'Learn about color theory and how primary colors create secondary colors.',
    icon: <Palette className="h-5 w-5" />,
  },
  {
    id: 'exp-4',
    title: 'Story Chain',
    category: 'language',
    ageRange: '6-14',
    duration: '15-25 min',
    difficulty: 'medium',
    environment: 'both',
    description: 'Build creative storytelling skills through a collaborative story-building game.',
    materials: ['Paper and pencils', 'Timer (optional)', 'Imaginative minds'],
    steps: [
      'First person starts with one sentence',
      'Next person adds a connected sentence',
      'Continue around the group, building the story',
      'Encourage unexpected twists and turns',
      'Optional: Set a timer for added challenge',
    ],
    learningOutcome: 'Develop creativity, listening skills, and narrative structure understanding.',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    id: 'exp-5',
    title: 'Invisible Ink Messages',
    category: 'science',
    ageRange: '7-12',
    duration: '20-30 min',
    difficulty: 'easy',
    environment: 'home',
    description: 'Write and reveal secret messages using simple kitchen chemistry.',
    materials: ['Lemon juice', 'Cotton swabs or paintbrush', 'White paper', 'Iron or lamp'],
    steps: [
      'Dip swab in lemon juice',
      'Write your secret message on paper',
      'Let it dry completely (becomes invisible)',
      'Reveal by carefully ironing the paper',
      'Watch your message magically appear!',
    ],
    learningOutcome: 'Learn about chemical reactions and oxidation through a fun spy activity.',
    icon: <Beaker className="h-5 w-5" />,
  },
  {
    id: 'exp-6',
    title: 'Emotion Charades',
    category: 'social',
    ageRange: '5-14',
    duration: '15-20 min',
    difficulty: 'medium',
    environment: 'both',
    description: 'Build emotional intelligence and expression through a classic guessing game.',
    materials: ['Paper with emotions written on them', 'Bowl or hat', 'Timer', 'Imaginative actors'],
    steps: [
      'Draw an emotion card without showing others',
      'Act out the emotion without speaking',
      'Others guess the emotion',
      'Discuss what cues gave it away',
      'Take turns and build empathy skills',
    ],
    learningOutcome: 'Develop emotional recognition, expression, and empathy for others.',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    id: 'exp-7',
    title: 'Math Scavenger Hunt',
    category: 'math',
    ageRange: '8-14',
    duration: '30-45 min',
    difficulty: 'medium',
    environment: 'both',
    description: 'Find and solve math problems hidden around your learning space.',
    materials: ['Index cards with math problems', 'Answers on back', 'Clipboard', 'Hiding spots'],
    steps: [
      'Teacher/parent creates math problems on cards',
      'Hide cards around the room or area',
      'Students find cards and solve each problem',
      'Check answers on the back',
      'Set a time limit for added excitement',
    ],
    learningOutcome: 'Practice math skills in an active, engaging way while improving problem-solving.',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'exp-8',
    title: 'Optical Illusion Exploration',
    category: 'science',
    ageRange: '8-14',
    duration: '20-30 min',
    difficulty: 'medium',
    environment: 'home',
    description: 'Discover how your eyes can be tricked by visual perception experiments.',
    materials: ['Paper and pencil', 'Ruler', 'Printed optical illusions (optional)', 'Mirror'],
    steps: [
      'Try drawing impossible shapes (Penrose triangle)',
      'Explore size illusions (same objects, different apparent size)',
      'Test color perception illusions',
      'Create your own simple optical illusion',
      'Discuss why your brain gets confused',
    ],
    learningOutcome: 'Learn about visual perception and how the brain interprets visual information.',
    icon: <Eye className="h-5 w-5" />,
  },
  {
    id: 'exp-9',
    title: 'Design Thinking Challenge',
    category: 'social',
    ageRange: '10-16',
    duration: '45-60 min',
    difficulty: 'hard',
    environment: 'classroom',
    description: 'Solve real-world problems using the design thinking process.',
    materials: ['Poster paper', 'Markers', 'Sticky notes', 'Real-world problem statement'],
    steps: [
      'Empathize: Understand who you\'re solving for',
      'Define: Clearly state the problem',
      'Ideate: Brainstorm many solutions',
      'Prototype: Build simple models/drawings',
      'Test: Get feedback and iterate',
    ],
    learningOutcome: 'Develop problem-solving, creativity, empathy, and collaboration skills.',
    icon: <Lightbulb className="h-5 w-5" />,
  },
]

const categoryIcons: Record<string, React.ReactNode> = {
  science: <FlaskConical className="h-4 w-4" />,
  math: <Target className="h-4 w-4" />,
  art: <Palette className="h-4 w-4" />,
  language: <BookOpen className="h-4 w-4" />,
  social: <Heart className="h-4 w-4" />,
}

export function LearningExperiments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)

  const filteredExperiments = experiments.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getEnvironmentIcon = (env: string) => {
    switch (env) {
      case 'home': return <Home className="h-4 w-4" />
      case 'classroom': return <GraduationCap className="h-4 w-4" />
      case 'both': return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Learning Experiments</h1>
        <p className="text-muted-foreground">
          A collection of hands-on experiments that teachers, parents, and students have found helpful
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search experiments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'science', 'math', 'art', 'language', 'social'] as Category[]).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className="gap-2"
            >
              {categoryIcons[cat]}
              <span className="capitalize">{cat === 'all' ? 'All' : cat}</span>
              {cat !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {experiments.filter(e => e.category === cat).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExperiments.map((exp) => (
          <Card
            key={exp.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedExperiment(exp)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary">{exp.icon}</span>
                  <CardTitle className="text-base">{exp.title}</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <span className={`w-2 h-2 rounded-full mr-1 ${getDifficultyColor(exp.difficulty)}`} />
                  {exp.difficulty}
                </Badge>
              </div>
              <div className="flex gap-2 text-xs">
                <Badge variant="secondary">{exp.category}</Badge>
                <Badge variant="outline">Age {exp.ageRange}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {exp.duration}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {exp.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExperiments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No experiments match your search</p>
          </CardContent>
        </Card>
      )}

      {selectedExperiment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary">{selectedExperiment.icon}</span>
                    <CardTitle className="text-2xl">{selectedExperiment.title}</CardTitle>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{selectedExperiment.category}</Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {selectedExperiment.duration}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      Age {selectedExperiment.ageRange}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      {getEnvironmentIcon(selectedExperiment.environment)}
                      <span className="capitalize">{selectedExperiment.environment}</span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className="gap-1"
                    >
                      <span className={`w-2 h-2 rounded-full ${getDifficultyColor(selectedExperiment.difficulty)}`} />
                      {selectedExperiment.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedExperiment(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedExperiment.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Learning Outcome</h4>
                <p className="text-muted-foreground">{selectedExperiment.learningOutcome}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Materials Needed</h4>
                <ScrollArea className="h-32">
                  <ul className="space-y-2">
                    {selectedExperiment.materials.map((material, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm">{material}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Steps</h4>
                <ol className="space-y-3">
                  {selectedExperiment.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-sm pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
