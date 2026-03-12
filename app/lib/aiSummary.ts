/**
 * サーバーサイド AI 要約ユーティリティ
 * Next.js Server Component / API Route から呼び出すこと（クライアントバンドル不可）。
 *
 * 環境変数:
 *   GEMINI_API_KEY  - Gemini API キー（本番はシークレット管理で保管）
 *
 * 参照: docs/nagumo/article_details/基本設計_API.md 「12. セキュリティ要件」
 */

const MODEL = 'gemini-2.5-flash'
const SYSTEM_PROMPT =
  'あなたは社内ナレッジ記事の要約アシスタントです。' +
  '与えられた記事を3〜5点の簡潔な箇条書きで要約してください。' +
  '各要点は改行（\n）で区切り、行頭に「・」を付けてください。' +
  '日本語で回答してください。'

/** シンプルなインメモリキャッシュ（TTL: 30分）
 *  記事の更新頻度は低いため長めに設定。page.tsx 側でキャッシュキーに updated_at を
 *  含めることで記事更新後の陳腐化を防いでいる。
 *  ⚠️  マルチインスタンス環境では Redis への移行を推奨
 */
type CacheEntry = { summary: string; expiresAt: number }
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 30 * 60_000

/** Gemini 呼び出しタイムアウト（ms） */
const FETCH_TIMEOUT_MS = 8_000

/**
 * generateSummary の戻り値型
 *   ok: true  → 要約文字列
 *   ok: false, error: 'quota_exceeded' → Gemini クォータ超過（retryAfterSecs で再試行時間を伝達）
 *   ok: false, error: 'failed'         → その他のエラー
 */
export type GenerateSummaryResult =
  | { ok: true; summary: string }
  | { ok: false; error: 'quota_exceeded'; retryAfterSecs: number }
  | { ok: false; error: 'failed' }

/**
 * Gemini 429 レスポンスの details 配列から RetryInfo.retryDelay（秒）を抽出する。
 * 見つからない場合は 60 秒をデフォルトとして返す。
 */
function parseRetryAfterSecs(errJson: unknown): number {
  if (typeof errJson !== 'object' || errJson === null) return 60
  const details = (errJson as Record<string, unknown>)?.error as Record<string, unknown> | undefined
  const detailsArr = details?.details
  if (!Array.isArray(detailsArr)) return 60
  for (const d of detailsArr) {
    if (typeof d === 'object' && d !== null && typeof (d as Record<string, unknown>).retryDelay === 'string') {
      const match = /^(\d+)s$/.exec((d as Record<string, unknown>).retryDelay as string)
      if (match) return parseInt(match[1], 10)
    }
  }
  return 60
}

/**
 * 記事の AI 要約を生成して返す。
 * 例外を投げず、常に GenerateSummaryResult を返す。
 *
 * @param cacheKey  キャッシュ識別子（記事IDを推奨、null でキャッシュ無効）
 * @param title     記事タイトル
 * @param body      記事本文
 */
export async function generateSummary(
  cacheKey: string | null,
  title: string,
  body: string,
): Promise<GenerateSummaryResult> {
  // キャッシュヒット
  if (cacheKey) {
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return { ok: true, summary: cached.summary }
    }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[aiSummary] GEMINI_API_KEY が未設定です。')
    return { ok: false, error: 'failed' }
  }

  if (!body.trim()) return { ok: false, error: 'failed' }

  // 本文が長すぎる場合は先頭 3000 文字に切り詰める（トークン節約）
  const truncatedBody = body.length > 3000 ? body.slice(0, 3000) + '…' : body

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

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
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      // サニタイズされたログ: APIキーやクォータ詳細を含めず status / code / message のみ出力
      const errCode = (errJson as Record<string, unknown> | null)?.error
        ? ((errJson as Record<string, Record<string, unknown>>).error?.code ?? res.status)
        : res.status
      const errStatus = (errJson as Record<string, unknown> | null)?.error
        ? String((errJson as Record<string, Record<string, unknown>>).error?.status ?? '')
        : ''
      const errMsg = String(
        (errJson as Record<string, unknown> | null)?.error
          ? (errJson as Record<string, Record<string, unknown>>).error?.message ?? ''
          : ''
      ).slice(0, 120)
      console.error(
        `[aiSummary] Gemini API error: HTTP ${res.status} | code=${errCode} | status=${errStatus} | message=${errMsg}`,
      )

      // 429: クォータ超過 → RetryInfo から再試行時間を抽出して上流に返す
      if (res.status === 429) {
        const retryAfterSecs = parseRetryAfterSecs(errJson)
        return { ok: false, error: 'quota_exceeded', retryAfterSecs }
      }

      return { ok: false, error: 'failed' }
    }

    const data = await res.json()
    // 防御的な型チェック: 想定外のレスポンス形状でも安全に処理する
    const rawText: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const summary = typeof rawText === 'string' ? rawText.trim() : ''

    if (!summary) {
      console.warn('[aiSummary] Gemini が空の要約を返しました。')
      return { ok: false, error: 'failed' }
    }

    if (cacheKey) {
      cache.set(cacheKey, { summary, expiresAt: Date.now() + CACHE_TTL_MS })
    }

    return { ok: true, summary }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[aiSummary] Gemini リクエストがタイムアウトしました（${FETCH_TIMEOUT_MS}ms）。`)
    } else {
      console.error('[aiSummary] 接続エラー:', err instanceof Error ? err.message : String(err))
    }
    return { ok: false, error: 'failed' }
  }
}
