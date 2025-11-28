"use client"

import { useState } from "react"
import useSWR from "swr"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Key, Copy, Trash2, Plus, Check } from "lucide-react"

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
  })

interface ApiKeyItem {
  id: string
  name: string
  created_at: string
  last_used_at: string | null
}

export default function SettingsPage() {
  const { data: keys, error, mutate } = useSWR<ApiKeyItem[]>("/api/keys", fetcher)
  const [newKeyName, setNewKeyName] = useState("")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isLoading = !keys && !error

  const createKey = async () => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName || "Default Key" }),
      })
      if (!res.ok) throw new Error("Failed to create key")
      const data = await res.json()
      setGeneratedKey(data.key)
      setNewKeyName("")
      mutate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const deleteKey = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/keys/${id}`, { method: "DELETE" })
      mutate()
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your API keys for the browser extension</p>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Generate New Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Generate API Key
            </CardTitle>
            <CardDescription>Create an API key to use with the browser extension</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Key name (optional)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button onClick={createKey} disabled={isCreating}>
                {isCreating ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1" />}
                Generate
              </Button>
            </div>

            {generatedKey && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Copy this key now. You won't be able to see it again!
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-background rounded text-sm font-mono break-all">{generatedKey}</code>
                  <Button variant="outline" size="icon" onClick={copyKey}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extension Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Extension Setup</CardTitle>
            <CardDescription>Use these values in your browser extension</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium">API Domain</label>
              <code className="block mt-1 p-2 bg-muted rounded text-sm">
                {typeof window !== "undefined" ? window.location.origin : ""}
              </code>
            </div>
            <div>
              <label className="text-sm font-medium">API Key</label>
              <p className="text-sm text-muted-foreground mt-1">
                Use a key from the list below, or generate a new one above.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Existing Keys */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>Manage your existing API keys</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center py-4">
                <Spinner className="h-6 w-6" />
              </div>
            )}

            {error && <ErrorMessage message="Failed to load API keys" onRetry={() => mutate()} />}

            {keys && keys.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No API keys yet. Generate one above to get started.
              </p>
            )}

            {keys && keys.length > 0 && (
              <div className="flex flex-col gap-2">
                {keys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDate(key.created_at)}
                        {key.last_used_at && ` • Last used ${formatDate(key.last_used_at)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteKey(key.id)}
                      disabled={deletingId === key.id}
                    >
                      {deletingId === key.id ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
