import type {
  ApprovalRequest,
  BulkActionRequest,
  ErrorResponse,
  ModerationRequest,
  PagedAuditLogResponse,
  PagedKnowledgeSummaryResponse,
  PagedUserListResponse,
  RejectRequest,
  SingleBulkActionResultResponse,
  SingleKnowledgeDetailResponse,
  SingleModerationResponse,
  SingleSimpleStatusResponse,
  SingleStatsResponse,
  SingleUserResponse,
  UserUpdateRequest,
} from "./types"

export class Scr10ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: Record<string, unknown>

  constructor(args: { status: number; message: string; code?: string; details?: Record<string, unknown> }) {
    super(args.message)
    this.name = "Scr10ApiError"
    this.status = args.status
    this.code = args.code
    this.details = args.details
  }
}

export type Scr10AdminApiClientOptions = {
  baseUrl?: string
  getAccessToken?: () => string | null | undefined
}

type RequestOptions = {
  signal?: AbortSignal
}

function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) return path
  const base = baseUrl.replace(/\/$/, "")
  const suffix = path.startsWith("/") ? path : `/${path}`
  return `${base}${suffix}`
}

function withQuery(path: string, query?: Record<string, string | number | boolean | undefined | null>): string {
  if (!query) return path
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    sp.set(key, String(value))
  }
  const qs = sp.toString()
  return qs ? `${path}?${qs}` : path
}

async function parseJsonSafely<T>(res: Response): Promise<T | undefined> {
  const text = await res.text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as T
  } catch {
    return undefined
  }
}

export function createScr10AdminApiClient(options: Scr10AdminApiClientOptions = {}) {
  const baseUrl =
    options.baseUrl ?? process.env.NEXT_PUBLIC_SCR10_API_BASE_URL ?? "http://localhost:8080/api/v1"

  const getAccessToken = options.getAccessToken

  async function request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH",
    path: string,
    args?: {
      query?: Record<string, string | number | boolean | undefined | null>
      body?: unknown
      options?: RequestOptions
    },
  ): Promise<T> {
    const url = joinUrl(baseUrl, withQuery(path, args?.query))

    const headers: Record<string, string> = {
      Accept: "application/json",
    }

    const token = getAccessToken?.()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    let body: BodyInit | undefined
    if (args?.body !== undefined) {
      headers["Content-Type"] = "application/json"
      body = JSON.stringify(args.body)
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
      signal: args?.options?.signal,
    })

    if (!res.ok) {
      const err = await parseJsonSafely<ErrorResponse>(res)
      throw new Scr10ApiError({
        status: res.status,
        code: err?.error?.code,
        message: err?.error?.message ?? `Request failed: ${res.status}`,
        details: err?.error?.details,
      })
    }

    const json = await parseJsonSafely<T>(res)
    if (json === undefined) {
      throw new Scr10ApiError({ status: res.status, message: "Empty response body" })
    }

    return json
  }

  return {
    // AdminKnowledge
    adminKnowledgeList: (params?: {
      status?: string
      q?: string
      author_id?: string
      tag?: string
      from?: string
      to?: string
      page?: number
      per_page?: number
      sort?: string
    }, options?: RequestOptions) =>
      request<PagedKnowledgeSummaryResponse>("GET", "/admin/knowledge", { query: params, options }),

    adminKnowledgeGetDetail: (id: string, options?: RequestOptions) =>
      request<SingleKnowledgeDetailResponse>("GET", `/admin/knowledge/${encodeURIComponent(id)}`, {
        options,
      }),

    adminKnowledgeApprove: (id: string, body?: ApprovalRequest, options?: RequestOptions) =>
      request<SingleSimpleStatusResponse>(
        "POST",
        `/admin/knowledge/${encodeURIComponent(id)}/approve`,
        { body, options },
      ),

    adminKnowledgeReject: (id: string, body: RejectRequest, options?: RequestOptions) =>
      request<SingleSimpleStatusResponse>(
        "POST",
        `/admin/knowledge/${encodeURIComponent(id)}/reject`,
        { body, options },
      ),

    adminKnowledgeBulkAction: (body: BulkActionRequest, options?: RequestOptions) =>
      request<SingleBulkActionResultResponse>("POST", "/admin/knowledge/bulk-action", {
        body,
        options,
      }),

    adminKnowledgeGetModeration: (id: string, options?: RequestOptions) =>
      request<SingleModerationResponse>(
        "GET",
        `/admin/knowledge/${encodeURIComponent(id)}/moderation`,
        { options },
      ),

    adminKnowledgePutModeration: (id: string, body: ModerationRequest, options?: RequestOptions) =>
      request<SingleModerationResponse>(
        "PUT",
        `/admin/knowledge/${encodeURIComponent(id)}/moderation`,
        { body, options },
      ),

    adminKnowledgeStats: (params?: { from?: string; to?: string }, options?: RequestOptions) =>
      request<SingleStatsResponse>("GET", "/admin/knowledge/stats", { query: params, options }),

    // AdminAudit
    adminAuditLogsList: (params?: {
      q?: string
      actor_id?: string
      target_type?: string
      target_id?: string
      from?: string
      to?: string
      page?: number
      per_page?: number
      sort?: string
    }, options?: RequestOptions) => request<PagedAuditLogResponse>("GET", "/admin/auditlogs", { query: params, options }),

    // AdminUsers
    adminUsersList: (params?: {
      q?: string
      role?: string
      status?: "active" | "inactive"
      page?: number
      per_page?: number
    }, options?: RequestOptions) => request<PagedUserListResponse>("GET", "/admin/users", { query: params, options }),

    adminUsersGet: (id: string, options?: RequestOptions) =>
      request<SingleUserResponse>("GET", `/admin/users/${encodeURIComponent(id)}`, { options }),

    adminUsersPatch: (id: string, body: UserUpdateRequest, options?: RequestOptions) =>
      request<SingleUserResponse>("PATCH", `/admin/users/${encodeURIComponent(id)}`, { body, options }),
  }
}