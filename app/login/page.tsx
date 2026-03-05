"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LoginForm from "../components/LoginForm"
import styles from "../pages/login/login.module.css"
import { login } from "../lib/auth"
import fetcher from "../lib/fetcher"

type FormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: FormData) {
    setLoading(true)
    try {
      // 1. ログイン API 呼び出し
      const res = await login(data.email, data.password)

      // 2. トークンを保存
      localStorage.setItem("token", res.token)
      localStorage.setItem("refreshToken", res.refreshToken)

      // 3. ユーザー情報取得（管理者判定含む）
      const mePromise = fetcher<{ id: number; username: string; email: string; displayName: string; roles?: string[]; isAdmin?: boolean }>("/api/v1/users/me")

      // 4. ダッシュボード・アクティビティ・ナレッジを並列取得
      const toDate = new Date()
      const fromDate = new Date(toDate)
      fromDate.setDate(fromDate.getDate() - 7)
      const toStr = toDate.toISOString().slice(0, 10)
      const fromStr = fromDate.toISOString().slice(0, 10)

      const [me] = await Promise.all([
        mePromise,
        fetcher("/api/v1/dashboard").catch(() => null),
        fetcher(`/api/v1/dashboard/activity?from=${fromStr}&to=${toStr}`).catch(() => null),
        fetcher("/api/v1/knowledge?recommend=1&recent=3").catch(() => null),
      ])

      // 5. ユーザー情報をストレージへ保存（管理者フラグ含む）
      localStorage.setItem("currentUser", JSON.stringify(me))

      router.push("/dashboard")
    } catch (err: any) {
      // LoginForm 内の serverError に伝播させる
      throw new Error(err?.message || "ネットワークエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.centerCard}>
        <div className={styles.cardTop}>
          <div className={styles.headerIllustration} aria-hidden="true" />
          <div className={styles.cardTitle}>team sharing</div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.formWrap}>
            <LoginForm onSubmit={handleSubmit} loading={loading} />
          </div>

          <div className={styles.helpBox}>
            <div>まだアカウントをお持ちでないですか？</div>
            <div className={styles.helpSub}>
              <Link href="/register" className={styles.helpLink}>
                アカウント登録はこちら
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
