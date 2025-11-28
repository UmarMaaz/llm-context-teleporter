"use client"

import useSWR from "swr"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorMessage } from "@/components/ui/error-message"
import { MessageSquare, ChevronRight } from "lucide-react"
import type { ConversationListItem } from "@/lib/types"

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
  })

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

export default function DashboardPage() {
  const { data: conversations, error, mutate } = useSWR<ConversationListItem[]>("/api/conversations", fetcher)

  const isLoading = !conversations && !error

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Conversations</h1>
        <p className="text-muted-foreground mt-1">View and manage your imported AI conversations</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-8" />
        </div>
      )}

      {error && <ErrorMessage message="Failed to load conversations" onRetry={() => mutate()} />}

      {conversations && conversations.length === 0 && (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="No conversations yet"
          description="Use the browser extension to import chats from ChatGPT, Claude, Gemini, and other LLM platforms."
        />
      )}

      {conversations && conversations.length > 0 && (
        <div className="flex flex-col gap-3">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/conversations/${conversation.id}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{conversation.title || "Untitled conversation"}</h3>
                      <Badge variant="secondary" className={getSourceColor(conversation.source)}>
                        {conversation.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(conversation.created_at)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  )
}
