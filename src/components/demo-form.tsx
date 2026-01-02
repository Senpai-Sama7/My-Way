'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const demoFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  grade: z.string().min(1, 'Please select a grade level'),
  interest: z.string().min(1, 'Please select an interest'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type DemoFormData = z.infer<typeof demoFormSchema>

export function DemoForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      name: '',
      email: '',
      grade: '',
      interest: '',
      message: '',
    },
  })

  const onSubmit = async (data: DemoFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Form submitted:', data)
    toast.success('Form submitted successfully!')
    reset()
  }

  const watchedGrade = watch('grade')
  const watchedInterest = watch('interest')

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Demo Form</CardTitle>
        <CardDescription>
          This form demonstrates React Hook Form with Zod validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grade Level</Label>
              <Select onValueChange={(value) => setValue('grade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6th Grade</SelectItem>
                  <SelectItem value="7">7th Grade</SelectItem>
                  <SelectItem value="8">8th Grade</SelectItem>
                  <SelectItem value="9">9th Grade</SelectItem>
                  <SelectItem value="10">10th Grade</SelectItem>
                  <SelectItem value="11">11th Grade</SelectItem>
                  <SelectItem value="12">12th Grade</SelectItem>
                  <SelectItem value="13">Undergraduate</SelectItem>
                </SelectContent>
              </Select>
              {errors.grade && (
                <p className="text-sm text-red-500">{errors.grade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Interest</Label>
              <Select onValueChange={(value) => setValue('interest', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="art">Art & Design</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                </SelectContent>
              </Select>
              {errors.interest && (
                <p className="text-sm text-red-500">{errors.interest.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Tell us about your learning goals..."
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {(watchedGrade || watchedInterest) && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Your Selections:</h4>
              <div className="text-sm text-muted-foreground">
                {watchedGrade && <p>Grade: {watchedGrade}</p>}
                {watchedInterest && <p>Interest: {watchedInterest}</p>}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}