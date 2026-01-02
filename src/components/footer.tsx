import { BrainCircuit } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/50">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span className="font-medium">Learn Your Way</span>
          </div>
          <p className="text-xs">
            Transforming textbooks with AI-powered personalization and multiple representations
          </p>
          <p className="text-xs text-muted-foreground/60">
            Powered by generative AI for enhanced learning experiences
          </p>
        </div>
      </div>
    </footer>
  )
}
