import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Zap, Shield, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <MessageSquare className="h-5 w-5" />
            <span>LLM Context Teleporter</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
          Store and Access Your AI Conversations
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Import conversations from ChatGPT, Claude, Gemini, and other LLM platforms. Keep your valuable AI interactions
          organized and accessible in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container max-w-5xl mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Multi-Platform Import</h3>
            <p className="text-sm text-muted-foreground">
              Import conversations from ChatGPT, Claude, Gemini, Groq, and more via our browser extension.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Organized Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              View all your conversations in one place, organized by source and date.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure Storage</h3>
            <p className="text-sm text-muted-foreground">
              Your conversations are securely stored and only accessible to you.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          LLM Context Teleporter - Store your AI conversations securely.
        </div>
      </footer>
    </div>
  )
}
