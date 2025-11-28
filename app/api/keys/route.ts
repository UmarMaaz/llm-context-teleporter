import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import type { ApiError } from "@/lib/types"
import crypto from "crypto"

// Generate a new API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const name = body.name?.trim() || "Default Key"

    // Generate a random API key
    const rawKey = `lct_${crypto.randomBytes(32).toString("hex")}`
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")

    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        key_hash: keyHash,
        name,
      })
      .select("id, name, created_at")
      .single()

    if (error) {
      console.error("Error creating API key:", error)
      return NextResponse.json<ApiError>({ error: "Failed to create API key" }, { status: 500 })
    }

    // Return the raw key only once - it won't be stored
    return NextResponse.json(
      {
        id: apiKey.id,
        key: rawKey,
        name: apiKey.name,
        created_at: apiKey.created_at,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API key creation error:", error)
    return NextResponse.json<ApiError>({ error: "Internal server error" }, { status: 500 })
  }
}

// List API keys (without the actual key values)
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: keys, error } = await supabase
      .from("api_keys")
      .select("id, name, created_at, last_used_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching API keys:", error)
      return NextResponse.json<ApiError>({ error: "Failed to fetch API keys" }, { status: 500 })
    }

    return NextResponse.json(keys)
  } catch (error) {
    console.error("API keys fetch error:", error)
    return NextResponse.json<ApiError>({ error: "Internal server error" }, { status: 500 })
  }
}
