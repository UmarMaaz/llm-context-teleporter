"use client"

import { use } from "react"
import useSWR from "swr"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { ArrowLeft, Download, Sparkles, User, Bot } from "lucide-react"
import type { ConversationDetail } from "@/lib/types"
import { cn } from "@/lib/utils"

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      if (res.status === 404) throw new Error("not_found")
      throw new Error("Failed to fetch")
    }
    return res.json()
  })

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    ChatGPT: "bg-emerald-100 text-emerald-800",
    Claude: "bg-orange-100 text-orange-800",
    Gemini: "bg-blue-100 text-blue-800",
    Groq: "bg-purple-100 text-purple-800",
  }
  return colors[source] || "bg-secondary text-secondary-foreground"
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data, error, mutate } = useSWR<ConversationDetail>(`/api/conversations/${id}`, fetcher)

  const isLoading = !data && !error
  const isNotFound = error?.message === "not_found"

  return (
    <AppShell>
      {/* Back button */}
      <Link href="/dashboard" className="inline-flex mb-4">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-8" />
        </div>
      )}

      {isNotFound && (
        <div className="text-center py-12">
          <h2 className="text-lg font-medium">Conversation not found</h2>
          <p className="text-muted-foreground mt-1">
            This conversation may have been deleted or you don't have access to it.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      )}

      {error && !isNotFound && <ErrorMessage message="Failed to load conversation" onRetry={() => mutate()} />}

      {data && (
        <>
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{data.conversation.title || "Untitled conversation"}</h1>
                  <Badge variant="secondary" className={getSourceColor(data.conversation.source)}>
                    {data.conversation.source}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(data.conversation.created_at)}</p>
              </div>

              {/* Future action buttons - placeholder */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled title="Coming soon">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" disabled title="Coming soon">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Summarize
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pb-4">
            {data.messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-3",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  )
}
