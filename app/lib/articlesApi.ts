/**
 * 記事詳細 API クライアント
 * バックエンド: GET /api/v1/knowledge/{id}
 * APIレスポンス仕様は docs/nagumo/article_details/基本設計_API.md を参照
 */

import type { ArticleDetail } from './mockArticles'

/**
 * ブラウザからは Next.js プロキシ経由（/api/v1）でリクエストしてCORSを回避する。
 * Server Component 等サーバー側からは環境変数で直接バックエンドを指す。
 */
const API_BASE_URL =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1')
    : '/api/v1'

/**
 * 記事詳細を取得する。
 * - token を渡すと liked_by_current_user が正確に返る
 * - 404 の場合は null を返す
 * @param id 記事ID
 * @param token JWT トークン（省略時は未認証リクエスト）
 */
export async function getArticle(id: string, token?: string): Promise<ArticleDetail | null> {
  // ブラウザ環境では localStorage からトークンを取得（token 引数が優先）
  const resolvedToken =
    token ?? (typeof window !== 'undefined' ? (localStorage.getItem('token') ?? undefined) : undefined)

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (resolvedToken) {
    headers['Authorization'] = `Bearer ${resolvedToken}`
  }

  const response = await fetch(`${API_BASE_URL}/knowledge/${id}`, { headers })

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`記事の取得に失敗しました (HTTP ${response.status})`)

  const json = await response.json()
  return json.data as ArticleDetail
}
