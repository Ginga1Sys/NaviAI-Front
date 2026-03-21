"use client"

import React, { useId, useState } from "react"
import styles from "../pages/login/login.module.css"

type LoginData = {
  email: string
  password: string
}

type Props = {
  defaultEmail?: string
  loading?: boolean
  errorMessage?: string
  onSubmit?: (data: LoginData) => Promise<void> | void
}

export default function LoginForm({ defaultEmail = "", loading = false, errorMessage = "", onSubmit }: Props) {
  const idPrefix = useId()
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState("")
  const [localLoading, setLocalLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(errorMessage || null)
  const [showPassword, setShowPassword] = useState(false)

  const submitting = loading || localLoading

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  function validate(): boolean {
    const errs: { email?: string; password?: string } = {}
    const id = email.trim()
    const pw = password

    if (!id) {
      errs.email = "必須項目です。"
    } else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(id)) errs.email = "有効なメールアドレスを入力してください。"
    }

    if (!pw) {
      errs.password = "必須項目です。"
    } else if (pw.length < 6) {
      errs.password = "パスワードは6文字以上で入力してください。"
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    const ok = validate()
    if (!ok) return
    setLocalLoading(true)
    try {
      if (onSubmit) {
        await onSubmit({ email, password })
      }
    } catch (err: any) {
      setServerError(err?.message || "ログインに失敗しました。")
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-live="polite" noValidate className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-email`}>メールアドレス</label>
        <input
          className={styles.input}
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((s) => ({ ...s, email: undefined })) }}
          required
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? `${idPrefix}-email-error` : undefined}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <div id={`${idPrefix}-email-error`} role="alert" className={styles.fieldError}>
            {fieldErrors.email}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${idPrefix}-password`}>パスワード</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className={styles.input}
            id={`${idPrefix}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((s) => ({ ...s, password: undefined })) }}
            required
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? `${idPrefix}-password-error` : undefined}
            autoComplete="current-password"
          />
          <button type="button" className={styles.toggleButton} onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}>
            {showPassword ? "非表示" : "表示"}
          </button>
        </div>
        {fieldErrors.password && (
          <div id={`${idPrefix}-password-error`} role="alert" className={styles.fieldError}>
            {fieldErrors.password}
          </div>
        )}
      </div>

      {serverError && (
        <div role="alert" aria-live="assertive" className={styles.error}>
          {serverError}
        </div>
      )}

      <div>
        <button className={styles.button} type="submit" disabled={submitting}>
          {submitting ? "送信中..." : "ログイン"}
        </button>
      </div>
    </form>
  )
}
