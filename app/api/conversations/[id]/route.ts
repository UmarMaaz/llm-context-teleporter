import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import type { ConversationDetail, ApiError } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ApiError>({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    // Validate id
    if (!id || typeof id !== "string") {
      return NextResponse.json<ApiError>({ error: "Invalid conversation ID" }, { status: 400 })
    }

    // Fetch the conversation (RLS ensures user can only access their own)
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, title, source, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json<ApiError>({ error: "Conversation not found" }, { status: 404 })
    }

    // Fetch all messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })

    if (msgError) {
      console.error("Error fetching messages:", msgError)
      return NextResponse.json<ApiError>({ error: "Failed to fetch messages" }, { status: 500 })
    }

    const response: ConversationDetail = {
      conversation,
      messages: messages || [],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Conversation detail error:", error)
    return NextResponse.json<ApiError>({ error: "Internal server error" }, { status: 500 })
  }
}
