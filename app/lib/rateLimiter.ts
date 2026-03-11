/**
 * シンプルなインメモリ レート制限ユーティリティ（MVP 用）
 *
 * ウィンドウ内のリクエスト数を Map で管理し、上限を超えた場合は
 * allowed=false を返す。
 *
 * ⚠️  本番・マルチインスタンス環境では Redis への移行を推奨。
 *      インメモリ方式はプロセス再起動でリセットされ、
 *      水平スケール時に各インスタンスのカウントが共有されない。
 *
 * 参照: docs/nagumo/article_details/基本設計_API.md
 *       「7. レート制限・スロットリング」
 */

type RateLimitEntry = {
  count: number
  /** ウィンドウ終了時刻（Unix ミリ秒） */
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export type RateLimitResult = {
  /** リクエストを許可するかどうか */
  allowed: boolean
  /** ウィンドウ内の残余リクエスト数 */
  remaining: number
  /** ウィンドウリセット時刻（Unix ミリ秒） */
  resetAt: number
}

/**
 * レート制限を確認する。
 *
 * @param key       識別子（ユーザーID または IP アドレス）
 * @param limit     ウィンドウ内の許容リクエスト数（デフォルト: 10）
 * @param windowMs  ウィンドウ幅（ミリ秒）（デフォルト: 60,000 = 1分）
 */
export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  // ウィンドウ未作成 or リセット済み
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  // 上限超過
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  }
}
