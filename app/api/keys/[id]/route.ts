import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import type { ApiError } from "@/lib/types"

// Delete an API key
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("api_keys").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting API key:", error)
      return NextResponse.json<ApiError>({ error: "Failed to delete API key" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API key deletion error:", error)
    return NextResponse.json<ApiError>({ error: "Internal server error" }, { status: 500 })
  }
}
