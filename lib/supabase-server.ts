import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SUPABASE_URL = "https://zkrfkvfespjvudxrebbe.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZrdmZlc3BqdnVkeHJlYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDc3MTMsImV4cCI6MjA3OTgyMzcxM30.wqKSaWThMS-8G4WPd_4KzHd2q1sW247Tt_kdPHSG8U0"

// Server-side Supabase client for API routes and server components
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
