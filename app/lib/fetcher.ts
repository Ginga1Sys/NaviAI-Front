/**
 * 汎用 fetch ユーティリティ
 * - Authorization ヘッダーに localStorage の JWT を自動付与（クライアント限定）
 * - 非 OK レスポンスを Error として throw
 */

export type FetcherOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>
  /**
   * true にすると Authorization ヘッダーを付与しない
   * デフォルトは false（自動付与）
   */
  skipAuth?: boolean
}

async function fetcher<T = unknown>(url: string, options: FetcherOptions = {}): Promise<T> {
  const { skipAuth = false, headers: extraHeaders, ...rest } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders ?? {}),
  }

  if (!skipAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const res = await fetch(url, { ...rest, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string })?.message ?? `HTTP ${res.status}`)
  }

  // 204 No Content など body が無いケース
  if (res.status === 204) return undefined as unknown as T

  return res.json() as Promise<T>
}

export default fetcher
