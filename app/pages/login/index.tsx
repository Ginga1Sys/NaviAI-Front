"use client"

import React from "react"
import { useRouter } from "next/navigation"
import LoginForm from "../../components/LoginForm"
import styles from "./login.module.css"
import { login } from "../../lib/auth"

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
        // トークンの保存はバックエンド設計に従う（ここでは簡易扱い）
        localStorage.setItem("token", res.token)
        router.push("/dashboard")
      } else {
        throw new Error(res?.message || "ログインに失敗しました。")
      }
    } catch (err: any) {
      throw new Error(err?.message || "ネットワークエラーが発生しました。")
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ログイン</h1>
      <div className={styles.formWrap}>
        <LoginForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
