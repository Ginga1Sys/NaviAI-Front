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
 * リクエストボディ: { title: string; body: string }
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
import { generateSummary } from '../../lib/aiSummary'

/** DB: knowledge.title VARCHAR(500) に合わせた上限 */
const MAX_TITLE_LENGTH = 500
/** リクエストボディサイズ上限 (100KB) */
const MAX_BODY_BYTES = 100_000

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
    return NextResponse.json({ error: 'リクエストボディが大きすぎます。' }, { status: 413 })
  }

  let title: string
  let body: string
  try {
    const parsed = await request.json()
    title = String(parsed.title ?? '')
    body  = String(parsed.body  ?? '')
  } catch {
    return NextResponse.json({ error: 'リクエストボディが不正です。' }, { status: 400 })
  }

  // [4] 入力バリデーション
  if (!body.trim()) {
    return NextResponse.json({ error: '記事本文が空です。' }, { status: 400 })
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: 'タイトルが長すぎます。' }, { status: 400 })
  }

  // 本文が長すぎる場合は先頭 3000 文字に切り詰める（トークン節約）
  const truncatedBody = body.length > 3000 ? body.slice(0, 3000) + '…' : body

  // [5][6] Gemini 呼び出しは aiSummary ユーティリティに委譲（APIキー・ログ管理を集約）
  const summary = await generateSummary(null, title, body)
  if (summary === null) {
    return NextResponse.json(
      { error: 'AI要約の生成に失敗しました。' },
      { status: 502 }
    )
  }

  // レート制限の残余をレスポンスヘッダに含める（クライアント側の参考情報）
  return NextResponse.json(
    { summary },
    { headers: { 'X-RateLimit-Remaining': String(remaining) } }
  )
}
