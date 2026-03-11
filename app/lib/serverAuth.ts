/**
 * サーバーサイド JWT 検証ユーティリティ
 *
 * 環境変数:
 *   JWT_PUBLIC_KEY  - RSA 公開鍵 PEM 文字列（RS256 推奨、本番必須）
 *   JWT_SECRET      - HMAC シークレット文字列（HS256 フォールバック）
 *
 * どちらも未設定の場合:
 *   - NODE_ENV=development のときは検証をスキップし開発用ダミーペイロードを返す
 *   - それ以外では null を返す（認証拒否）
 *
 * 参照: docs/nagumo/article_details/基本設計_API.md 「4. 認証・認可」
 */

import { jwtVerify, importSPKI } from 'jose'
import { NextRequest } from 'next/server'

export type AuthPayload = {
  /** ユーザーID（UUID） */
  sub: string
  email?: string
  role?: string
  iat?: number
  exp?: number
}

/**
 * リクエストの `Authorization: Bearer <token>` を検証し、ペイロードを返す。
 * 検証失敗・ヘッダ未設定の場合は null を返す。
 */
export async function verifyAuth(request: NextRequest): Promise<AuthPayload | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)

  const publicKeyPem = process.env.JWT_PUBLIC_KEY
  const secret = process.env.JWT_SECRET

  // 開発モード: 鍵が未設定の場合は検証をスキップ
  if (!publicKeyPem && !secret) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[serverAuth] JWT_PUBLIC_KEY / JWT_SECRET が未設定です。' +
        '開発モードのため JWT 検証をスキップします。'
      )
      return { sub: 'dev-user', role: 'user' }
    }
    return null
  }

  try {
    if (publicKeyPem) {
      // RS256（本番推奨）
      const key = await importSPKI(publicKeyPem, 'RS256')
      const { payload } = await jwtVerify(token, key)
      return payload as unknown as AuthPayload
    }

    // HS256（開発用フォールバック）
    const key = new TextEncoder().encode(secret!)
    const { payload } = await jwtVerify(token, key)
    return payload as unknown as AuthPayload
  } catch {
    // 署名不正・期限切れ等はすべて null
    return null
  }
}
