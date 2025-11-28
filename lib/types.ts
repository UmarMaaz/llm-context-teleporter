// Shared TypeScript types for the LLM Context Teleporter

export interface Profile {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  source: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

// API Request/Response types
export interface IngestRequest {
  source: string
  title?: string
  messages: {
    role: "user" | "assistant"
    content: string
  }[]
}

export interface IngestResponse {
  conversation_id: string
}

export interface ConversationListItem {
  id: string
  title: string | null
  source: string
  created_at: string
  updated_at: string
}

export interface ConversationDetail {
  conversation: Omit<Conversation, "user_id">
  messages: Message[]
}

export interface ApiError {
  error: string
}

export interface ApiKey {
  id: string
  user_id: string
  key_hash: string
  name: string
  created_at: string
  last_used_at: string | null
}
