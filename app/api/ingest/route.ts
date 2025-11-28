import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import type { IngestRequest, IngestResponse, ApiError } from "@/lib/types"



export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null

    // Only use session auth
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id || null

    if (!userId) {
      // Changed error message to reflect session auth expectation
      return NextResponse.json<ApiError>({ error: "Unauthorized. Please log in to the web app." }, { status: 401 })
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
