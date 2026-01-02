import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, BrainCircuit, Settings } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">Learn Your Way</span>
              <span className="text-xs text-muted-foreground">AI-Augmented Textbook</span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Badge variant="outline" className="hidden sm:flex">
            <BookOpen className="mr-1 h-3 w-3" />
            Interactive Learning
          </Badge>
        </nav>
      </div>
    </header>
  )
}
