import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import type { ConversationListItem, ApiError } from "@/lib/types"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ApiError>({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    // Fetch conversations for the current user
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("id, title, source, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return NextResponse.json<ApiError>({ error: "Failed to fetch conversations" }, { status: 500 })
    }

    return NextResponse.json<ConversationListItem[]>(conversations || [])
  } catch (error) {
    console.error("Conversations list error:", error)
    return NextResponse.json<ApiError>({ error: "Internal server error" }, { status: 500 })
  }
}
