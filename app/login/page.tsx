"use client"

import React from "react"
import { useRouter } from "next/navigation"
import LoginForm from "../components/LoginForm"
import styles from "../pages/login/login.module.css"
import { login } from "../lib/auth"

type FormData = {
  identifier: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()

  async function handleSubmit(data: FormData) {
    try {
      const res = await login(data.identifier, data.password)
      if (res?.token) {
        localStorage.setItem("token", res.token)
        router.push("/dashboard")
      } else {
        throw new Error(res?.message || "ログインに失敗しました。")
      }
    } catch (err: any) {
      // 上位でハンドリングされる想定のためここではthrowする
      throw new Error(err?.message || "ネットワークエラーが発生しました。")
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
            <LoginForm onSubmit={handleSubmit} />
          </div>

          <div className={styles.helpBox}>
            <div>まだアカウントをお持ちでないですか？</div>
            <div className={styles.helpSub}>アカウント登録はこちらです！</div>
          </div>
        </div>
      </div>
    </div>
  )
}
