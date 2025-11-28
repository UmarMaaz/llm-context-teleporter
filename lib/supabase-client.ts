import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = "https://zkrfkvfespjvudxrebbe.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZrdmZlc3BqdnVkeHJlYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDc3MTMsImV4cCI6MjA3OTgyMzcxM30.wqKSaWThMS-8G4WPd_4KzHd2q1sW247Tt_kdPHSG8U0"

// Browser-side Supabase client for client components
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
