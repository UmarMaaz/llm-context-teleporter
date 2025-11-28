import { type NextRequest, NextResponse } from "next/server"
import { createClient as createBrowserClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-server"
import type { IngestRequest, IngestResponse, ApiError } from "@/lib/types"
import crypto from "crypto"

const SUPABASE_URL = "https://zkrfkvfespjvudxrebbe.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZrdmZlc3BqdnVkeHJlYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDc3MTMsImV4cCI6MjA3OTgyMzcxM30.wqKSaWThMS-8G4WPd_4KzHd2q1sW247Tt_kdPHSG8U0"

// Helper function to verify API key
async function verifyApiKey(apiKey: string): Promise<string | null> {
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

  // Use a direct client without cookie-based auth for API key lookups
  const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data, error } = await supabase.from("api_keys").select("user_id, id").eq("key_hash", keyHash).single()

  if (error || !data) {
    console.error("[v0] API key verification failed:", error?.message)
    return null
  }

  // Update last_used_at
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id)

  return data.user_id
}

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null

    const authHeader = request.headers.get("Authorization")

    if (authHeader?.startsWith("Bearer ")) {
      const apiKey = authHeader.slice(7)
      userId = await verifyApiKey(apiKey)
    }

    // If no API key auth, try session auth
    if (!userId) {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id || null
    }

    if (!userId) {
      return NextResponse.json<ApiError>({ error: "Unauthorized. Please provide a valid API key." }, { status: 401 })
    }

    // Parse and validate request body
    const body: IngestRequest = await request.json()

    // Validate source
    if (!body.source || typeof body.source !== "string" || body.source.trim() === "") {
      return NextResponse.json<ApiError>({ error: "Source must be a non-empty string" }, { status: 400 })
    }

    // Validate messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json<ApiError>({ error: "Messages must be a non-empty array" }, { status: 400 })
    }

    // Validate each message
    for (const msg of body.messages) {
      if (!msg.role || !["user", "assistant"].includes(msg.role)) {
        return NextResponse.json<ApiError>(
          { error: "Each message must have a role of 'user' or 'assistant'" },
          { status: 400 },
        )
      }
      if (!msg.content || typeof msg.content !== "string") {
        return NextResponse.json<ApiError>({ error: "Each message must have content as a string" }, { status: 400 })
      }
    }

    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Create conversation
    const title = body.title?.trim() || `Conversation from ${body.source}`

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        source: body.source.trim(),
        title,
      })
      .select("id")
      .single()

    if (convError || !conversation) {
      console.error("Error creating conversation:", convError)
      return NextResponse.json<ApiError>({ error: "Failed to create conversation" }, { status: 500 })
    }

    // Insert all messages
    const messagesData = body.messages.map((msg) => ({
      conversation_id: conversation.id,
      role: msg.role,
      content: msg.content,
    }))

    const { error: msgError } = await supabase.from("messages").insert(messagesData)

    if (msgError) {
      console.error("Error inserting messages:", msgError)
      // Attempt to clean up the conversation
      await supabase.from("conversations").delete().eq("id", conversation.id)
      return NextResponse.json<ApiError>({ error: "Failed to save messages" }, { status: 500 })
    }

    return NextResponse.json<IngestResponse>({ conversation_id: conversation.id }, { status: 201 })
  } catch (error) {
    console.error("Ingest error:", error)
    return NextResponse.json<ApiError>({ error: "Internal server error" }, { status: 500 })
  }
}
