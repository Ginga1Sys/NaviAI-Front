/**
 * POST /api/summarize
 * 記事本文を受け取り、AI 要約を返す（クライアントサイドのフォールバック用）。
 *
 * ⚠️  通常は Server Component（app/article_detail/page.tsx）が
 *      サーバー側で要約を生成してページに埋め込む。
 *      本エンドポイントは「再試行」ボタン等のクライアント起点の呼び出し専用。
 *
 * 必要な環境変数:
 *   GEMINI_API_KEY  - app/lib/aiSummary.ts が参照（本ファイルでは直接不要）
 *   JWT_PUBLIC_KEY  - JWT RS256 公開鍵 PEM（本番）または JWT_SECRET（開発）
 *
 * リクエストボディ: { title: string; body: string; articleId?: string }
 * レスポンス:       { summary: string }
 *
 * セキュリティ対策:
 *   [1] JWT 認証: Authorization: Bearer <token> を必須とする
 *   [2] レート制限: ユーザーIDを鍵に 10 req/min で制御
 *   [3] Content-Length 上限: 100KB 超は 413 で拒否
 *   [4] 入力検証: title 最大長・body 空チェック
 *   [5][6] Gemini 呼び出しは aiSummary ユーティリティが担保（APIキー/ログ処理を集約）
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '../../lib/serverAuth'
import { checkRateLimit } from '../../lib/rateLimiter'
import { generateSummary, type GenerateSummaryResult } from '../../lib/aiSummary'

/** DB: knowledge.title VARCHAR(500) に合わせた上限 */
const MAX_TITLE_LENGTH = 500
/** リクエストボディサイズ上限 (100KB) */
const MAX_BODY_BYTES = 100_000
/** articleId の最大長（DB の knowledge.id に合わせた上限） */
const MAX_ARTICLE_ID_LENGTH = 100
/** articleId として許容する文字（英数字・ハイフン・アンダースコア） */
const ARTICLE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/

export async function POST(request: NextRequest) {
  // [1] JWT 認証チェック
  const authPayload = await verifyAuth(request)
  if (!authPayload) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  // [2] レート制限（ユーザーIDベース: 10 req/min）
  const { allowed, remaining, resetAt } = checkRateLimit(
    `summarize:${authPayload.sub}`,
    10,
    60_000,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'リクエスト数の上限に達しました。しばらく待ってから再試行してください。' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  // [3] Content-Length 上限チェック（パース前に巨大ペイロードを排除）
  const contentLength = parseInt(request.headers.get('content-length') ?? '0', 10)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'リクエストボディが大きすぎます。' },
      { status: 413, headers: { 'X-RateLimit-Remaining': String(remaining) } },
    )
  }

  let title: string
  let body: string
  let articleId: string | null
  try {
    const parsed = await request.json()
    title     = String(parsed.title     ?? '')
    body      = String(parsed.body      ?? '')
    // articleId は任意フィールド。未送信・null・空文字はキャッシュ無効扱い
    const rawId = parsed.articleId
    articleId = (typeof rawId === 'string' && rawId.length > 0) ? rawId : null
  } catch {
    return NextResponse.json(
      { error: 'リクエストボディが不正です。' },
      { status: 400, headers: { 'X-RateLimit-Remaining': String(remaining) } },
    )
  }

  // [4] 入力バリデーション
  if (!body.trim()) {
    return NextResponse.json(
      { error: '記事本文が空です。' },
      { status: 400, headers: { 'X-RateLimit-Remaining': String(remaining) } },
    )
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: 'タイトルが長すぎます。' },
      { status: 400, headers: { 'X-RateLimit-Remaining': String(remaining) } },
    )
  }
  // articleId が送られた場合は長さ・文字種を検証してキャッシュキーに使用する
  if (articleId !== null) {
    if (articleId.length > MAX_ARTICLE_ID_LENGTH || !ARTICLE_ID_PATTERN.test(articleId)) {
      return NextResponse.json(
        { error: '記事IDの形式が不正です。' },
        { status: 400, headers: { 'X-RateLimit-Remaining': String(remaining) } },
      )
    }
  }

  // [5][6] Gemini 呼び出しは aiSummary ユーティリティに委譲（APIキー・ログ管理を集約）
  // ※ 本文の切り詰めは aiSummary 内部で行うためここでは不要
  // articleId をキャッシュキーに使うことで再試行時のキャッシュヒット率が向上する
  const result: GenerateSummaryResult = await generateSummary(articleId, title, body)

  if (!result.ok) {
    // 429: Gemini クォータ超過 → RetryInfo の再試行秒数をクライアントに伝える
    if (result.error === 'quota_exceeded') {
      return NextResponse.json(
        { error: 'APIの利用上限に達しました。しばらく待ってから再試行してください。' },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfterSecs),
            'X-RateLimit-Remaining': '0',
          },
        },
      )
    }
    return NextResponse.json(
      { error: 'AI要約の生成に失敗しました。' },
      { status: 502, headers: { 'X-RateLimit-Remaining': String(remaining) } },
    )
  }

  // レート制限の残余をレスポンスヘッダに含める（クライアント側の参考情報）
  return NextResponse.json(
    { summary: result.summary },
    { headers: { 'X-RateLimit-Remaining': String(remaining) } },
  )
}
