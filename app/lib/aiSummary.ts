/**
 * サーバーサイド AI 要約ユーティリティ
 * Next.js Server Component / API Route から呼び出すこと（クライアントバンドル不可）。
 *
 * 環境変数:
 *   GEMINI_API_KEY  - Gemini API キー（本番はシークレット管理で保管）
 *
 * 参照: docs/nagumo/article_details/基本設計_API.md 「12. セキュリティ要件」
 */

const MODEL = 'gemini-2.0-flash-lite'
const SYSTEM_PROMPT =
  'あなたは社内ナレッジ記事の要約アシスタントです。' +
  '与えられた記事を3〜5点の簡潔な箇条書きで要約してください。' +
  '各要点は改行（\n）で区切り、行頭に「・」を付けてください。' +
  '日本語で回答してください。'

/** シンプルなインメモリキャッシュ（TTL: 5分）
 *  ⚠️  マルチインスタンス環境では Redis への移行を推奨
 */
type CacheEntry = { summary: string; expiresAt: number }
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60_000

/**
 * 記事の AI 要約を生成して返す。
 * 失敗時は null を返す（例外を投げない）。
 *
 * @param cacheKey  キャッシュ識別子（記事IDを推奨、null でキャッシュ無効）
 * @param title     記事タイトル
 * @param body      記事本文
 */
export async function generateSummary(
  cacheKey: string | null,
  title: string,
  body: string,
): Promise<string | null> {
  // キャッシュヒット
  if (cacheKey) {
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.summary
    }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[aiSummary] GEMINI_API_KEY が未設定です。')
    return null
  }

  if (!body.trim()) return null

  // 本文が長すぎる場合は先頭 3000 文字に切り詰める（トークン節約）
  const truncatedBody = body.length > 3000 ? body.slice(0, 3000) + '…' : body

  try {
    // APIキーは URL クエリではなく x-goog-api-key ヘッダで送信（URL漏洩防止）
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: 'user',
              parts: [{ text: `タイトル: ${title}\n\n本文:\n${truncatedBody}` }],
            },
          ],
          generationConfig: { maxOutputTokens: 512, temperature: 0.3 },
        }),
      },
    )

    if (!res.ok) {
      // 外部APIエラーの詳細はサーバーログのみに記録（クライアントへは返さない）
      const errJson = await res.json().catch(() => ({}))
      console.error('[aiSummary] Gemini API error:', res.status, JSON.stringify(errJson))
      return null
    }

    const data = await res.json()
    const summary: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    if (summary && cacheKey) {
      cache.set(cacheKey, { summary, expiresAt: Date.now() + CACHE_TTL_MS })
    }

    return summary || null
  } catch (err) {
    console.error('[aiSummary] 接続エラー:', err)
    return null
  }
}
