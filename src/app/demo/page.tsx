'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { format, addDays, startOfWeek } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { DemoForm } from '@/components/demo-form'
import {
  Sun,
  Moon,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Zap,
  CheckCircle
} from 'lucide-react'

// Mock data for charts
const chartData = [
  { name: 'Mon', learning: 45, practice: 32 },
  { name: 'Tue', learning: 52, practice: 41 },
  { name: 'Wed', learning: 38, practice: 29 },
  { name: 'Thu', learning: 61, practice: 48 },
  { name: 'Fri', learning: 55, practice: 35 },
  { name: 'Sat', learning: 67, practice: 52 },
  { name: 'Sun', learning: 43, practice: 38 },
]

const pieData = [
  { name: 'Physics', value: 35, color: '#8884d8' },
  { name: 'Math', value: 25, color: '#82ca9d' },
  { name: 'History', value: 20, color: '#ffc658' },
  { name: 'Biology', value: 20, color: '#ff7c7c' },
]

const learningGoalsSchema = z.object({
  dailyGoal: z.number().min(5).max(180),
  weeklyGoal: z.number().min(30).max(1000),
})

type LearningGoalsData = z.infer<typeof learningGoalsSchema>

export default function DemoPage() {
  const [showAnimations, setShowAnimations] = useState(false)
  const { preferences, setPreferences, isLoading, setIsLoading } = useAppStore()

  // Mock API call with TanStack Query
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        totalMinutes: 1247,
        sessionsCompleted: 23,
        currentStreak: 7,
        favoriteSubject: 'Physics',
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LearningGoalsData>({
    resolver: zodResolver(learningGoalsSchema),
    defaultValues: {
      dailyGoal: preferences?.dailyGoal || 30,
      weeklyGoal: 210,
    },
  })

  const onSubmitGoals = async (data: LearningGoalsData) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setPreferences({
      ...preferences,
      dailyGoal: data.dailyGoal,
      gradeLevel: preferences?.gradeLevel || 8,
      interest: preferences?.interest || '',
      learningStyle: preferences?.learningStyle || 'reading',
    })
    setIsLoading(false)
  }

  const currentWeek = startOfWeek(new Date())
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">Feature Demo</h1>
          <p className="text-xl text-muted-foreground">
            Showcase of all implemented features
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Next Themes</Badge>
            <Badge variant="secondary">Framer Motion</Badge>
            <Badge variant="secondary">React Hook Form</Badge>
            <Badge variant="secondary">TanStack Query</Badge>
            <Badge variant="secondary">Zustand</Badge>
            <Badge variant="secondary">Recharts</Badge>
            <Badge variant="secondary">Date-fns</Badge>
          </div>
        </motion.div>

        {/* Animation Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Framer Motion Animations
            </CardTitle>
            <CardDescription>
              Smooth animations powered by Framer Motion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowAnimations(!showAnimations)}
              className="mb-4"
            >
              {showAnimations ? 'Hide' : 'Show'} Animations
            </Button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {showAnimations && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: i * 0.1,
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                      }}
                      className="p-4 bg-primary/10 rounded-lg text-center"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        🎯
                      </motion.div>
                      <p className="text-sm mt-2">Item {i + 1}</p>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charts Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Learning Progress (Recharts)
              </CardTitle>
              <CardDescription>
                Weekly learning and practice minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="learning" fill="#8884d8" name="Learning (min)" />
                  <Bar dataKey="practice" fill="#82ca9d" name="Practice (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Subject Distribution
              </CardTitle>
              <CardDescription>
                Time spent by subject area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Zustand State Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Zustand State Management
            </CardTitle>
            <CardDescription>
              Persistent state with Zustand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Daily Goal</Label>
                  <p className="text-2xl font-bold text-primary">
                    {preferences?.dailyGoal || 30} min
                  </p>
                </div>
                <div>
                  <Label>Loading State</Label>
                  <p className={`text-lg ${isLoading ? 'text-orange-500' : 'text-green-500'}`}>
                    {isLoading ? 'Loading...' : 'Ready'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsLoading(!isLoading)}
                variant="outline"
              >
                Toggle Loading State
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TanStack Query Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              TanStack Query Data Fetching
            </CardTitle>
            <CardDescription>
              Efficient data fetching with caching
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userStats?.totalMinutes}</p>
                  <p className="text-sm text-muted-foreground">Total Minutes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userStats?.sessionsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userStats?.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userStats?.favoriteSubject}</p>
                  <p className="text-sm text-muted-foreground">Top Subject</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date-fns Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date-fns Utilities
            </CardTitle>
            <CardDescription>
              Powerful date manipulation with date-fns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Current Week</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {weekDays.map((day, index) => (
                    <div key={index} className="text-center p-2 bg-muted rounded">
                      <p className="text-sm font-medium">{format(day, 'EEE')}</p>
                      <p className="text-xs text-muted-foreground">{format(day, 'd')}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Today</Label>
                  <p className="text-lg">{format(new Date(), 'PPP')}</p>
                </div>
                <div>
                  <Label>Next Week</Label>
                  <p className="text-lg">{format(addDays(new Date(), 7), 'PPP')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* React Hook Form Demo */}
        <DemoForm />

        {/* Form with Zustand integration */}
        <Card>
          <CardHeader>
            <CardTitle>Update Learning Goals</CardTitle>
            <CardDescription>
              Form with React Hook Form + Zustand state management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitGoals)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyGoal">Daily Goal (minutes)</Label>
                  <Input
                    id="dailyGoal"
                    type="number"
                    {...register('dailyGoal', { valueAsNumber: true })}
                  />
                  {errors.dailyGoal && (
                    <p className="text-sm text-red-500">{errors.dailyGoal.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyGoal">Weekly Goal (minutes)</Label>
                  <Input
                    id="weeklyGoal"
                    type="number"
                    {...register('weeklyGoal', { valueAsNumber: true })}
                  />
                  {errors.weeklyGoal && (
                    <p className="text-sm text-red-500">{errors.weeklyGoal.message}</p>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Goals'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}