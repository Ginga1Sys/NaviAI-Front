export type Error = {
  code: string
  message: string
  details?: Record<string, unknown>
}

export type ErrorResponse = {
  error: Error
}

export type Meta = {
  page: number
  per_page: number
  total: number
}

export type Role = "admin" | "user" | "moderator"

export type KnowledgeStatus = "draft" | "pending" | "published" | "declined" | "archived"

export type BulkAction = "approve" | "reject"

export type UserBrief = {
  id: string
  name: string
}

export type KnowledgeSummary = {
  id: string
  title: string
  summary?: string
  author: UserBrief
  status: KnowledgeStatus
  category?: string
  submitted_at?: string
}

export type KnowledgeDetail = {
  id: string
  title: string
  body: string
  author: UserBrief
  status: KnowledgeStatus
  tags?: string[]
  category?: string
  created_at?: string
  updated_at?: string
  submitted_at?: string
}

export type ApprovalRequest = {
  note?: string
}

export type RejectRequest = {
  reason: string
}

export type SimpleStatus = {
  id: string
  status: KnowledgeStatus
  published_at?: string | null
}

export type BulkActionRequest = {
  action: BulkAction
  ids: string[]
  reason?: string
}

export type BulkActionItemError = {
  code: string
  message: string
}

export type BulkActionItemResult = {
  id: string
  ok: boolean
  error?: BulkActionItemError | null
}

export type BulkActionResult = {
  action: BulkAction
  results: BulkActionItemResult[]
  summary: {
    ok: number
    failed: number
  }
}

export type ModerationRequest = {
  internal_note?: string
}

export type ModerationResponse = {
  knowledge_id: string
  internal_note: string
  updated_by: UserBrief
  updated_at: string
}

export type StatsResponse = {
  pending: number
  published: number
  declined: number
}

export type Target = {
  type: string
  id: string
}

export type AuditLogItem = {
  id: string
  action: string
  actor: UserBrief
  target: Target
  detail?: Record<string, unknown>
  created_at: string
}

export type UserListItem = {
  id: string
  name: string
  email: string
  role: Role
  is_active: boolean
  created_at: string
}

export type UserUpdateRequest = {
  role?: Role
  is_active?: boolean
  reason?: string
}

export type PagedKnowledgeSummaryResponse = {
  data: KnowledgeSummary[]
  meta: Meta
}

export type SingleKnowledgeDetailResponse = {
  data: KnowledgeDetail
}

export type SingleSimpleStatusResponse = {
  data: SimpleStatus
}

export type SingleBulkActionResultResponse = {
  data: BulkActionResult
}

export type SingleModerationResponse = {
  data: ModerationResponse
}

export type SingleStatsResponse = {
  data: StatsResponse
}

export type PagedAuditLogResponse = {
  data: AuditLogItem[]
  meta: Meta
}

export type PagedUserListResponse = {
  data: UserListItem[]
  meta: Meta
}

export type SingleUserResponse = {
  data: UserListItem
}