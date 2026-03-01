"use client"

import React, { useId, useState } from "react"
import styles from "../pages/login/login.module.css"

type RegisterData = {
  name: string
  email: string
  password: string
}

type Props = {
  onSuccess?: () => void
}

export default function RegisterForm({ onSuccess }: Props) {
  const idPrefix = useId()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    passwordConfirm?: string
  }>({})

  function validate(): boolean {
    const errs: typeof fieldErrors = {}

    if (!name.trim()) {
      errs.name = "必須項目です。"
    }

    const emailRe = /^[A-Za-z0-9._%+-]+@ginga\.info$/
    if (!email.trim()) {
      errs.email = "必須項目です。"
    } else if (!emailRe.test(email.trim())) {
      errs.email = "@ginga.info ドメインのメールアドレスを入力してください。"
    }

    if (!password) {
      errs.password = "必須項目です。"
    } else if (password.length < 8) {
      errs.password = "パスワードは8文字以上で入力してください。"
    }

    if (!passwordConfirm) {
      errs.passwordConfirm = "必須項目です。"
    } else if (password !== passwordConfirm) {
      errs.passwordConfirm = "パスワードが一致しません。"
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    setSuccessMessage(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name.trim(),
          email: email.trim(),
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error((data as { message?: string })?.message ?? "登録に失敗しました。")
      }

      setSuccessMessage(
        "登録を受け付けました。確認メールをお送りしましたので、メール内のリンクをクリックしてアカウントを有効化してください。"
      )
      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ネットワークエラーが発生しました。"
      setServerError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-live="polite" noValidate className={styles.form}>

      {/* 名前 */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-name`}>
          名前
        </label>
        <input
          className={styles.input}
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setFieldErrors((s) => ({ ...s, name: undefined }))
          }}
          required
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? `${idPrefix}-name-error` : undefined}
          autoComplete="name"
        />
        {fieldErrors.name && (
          <div id={`${idPrefix}-name-error`} role="alert" className={styles.fieldError}>
            {fieldErrors.name}
          </div>
        )}
      </div>

      {/* メールアドレス */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-email`}>
          メールアドレス
          <span className={styles.fieldHint}>（@ginga.info ドメインのみ）</span>
        </label>
        <input
          className={styles.input}
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setFieldErrors((s) => ({ ...s, email: undefined }))
          }}
          required
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? `${idPrefix}-email-error` : undefined}
          autoComplete="email"
          placeholder="例: taro@ginga.info"
        />
        {fieldErrors.email && (
          <div id={`${idPrefix}-email-error`} role="alert" className={styles.fieldError}>
            {fieldErrors.email}
          </div>
        )}
      </div>

      {/* パスワード */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-password`}>
          パスワード
          <span className={styles.fieldHint}>（8文字以上）</span>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className={styles.input}
            id={`${idPrefix}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setFieldErrors((s) => ({ ...s, password: undefined }))
            }}
            required
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? `${idPrefix}-password-error` : undefined}
            autoComplete="new-password"
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
          >
            {showPassword ? "非表示" : "表示"}
          </button>
        </div>
        {fieldErrors.password && (
          <div id={`${idPrefix}-password-error`} role="alert" className={styles.fieldError}>
            {fieldErrors.password}
          </div>
        )}
      </div>

      {/* パスワード（確認） */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-passwordConfirm`}>
          パスワード（確認）
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className={styles.input}
            id={`${idPrefix}-passwordConfirm`}
            name="passwordConfirm"
            type={showPasswordConfirm ? "text" : "password"}
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value)
              setFieldErrors((s) => ({ ...s, passwordConfirm: undefined }))
            }}
            required
            aria-invalid={!!fieldErrors.passwordConfirm}
            aria-describedby={
              fieldErrors.passwordConfirm ? `${idPrefix}-passwordConfirm-error` : undefined
            }
            autoComplete="new-password"
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPasswordConfirm((s) => !s)}
            aria-pressed={showPasswordConfirm}
          >
            {showPasswordConfirm ? "非表示" : "表示"}
          </button>
        </div>
        {fieldErrors.passwordConfirm && (
          <div
            id={`${idPrefix}-passwordConfirm-error`}
            role="alert"
            className={styles.fieldError}
          >
            {fieldErrors.passwordConfirm}
          </div>
        )}
      </div>

      {/* サーバーエラー */}
      {serverError && (
        <div role="alert" aria-live="assertive" className={styles.error}>
          {serverError}
        </div>
      )}

      {/* 成功メッセージ */}
      {successMessage && (
        <div role="status" aria-live="polite" className={styles.successMessage}>
          {successMessage}
        </div>
      )}

      <div>
        <button className={styles.button} type="submit" disabled={submitting}>
          {submitting ? "送信中..." : "会員登録"}
        </button>
      </div>
    </form>
  )
}
