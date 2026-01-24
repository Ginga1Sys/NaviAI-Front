"use client"

import React, { useId, useState } from "react"
import styles from "../pages/login/login.module.css"

type LoginData = {
  identifier: string
  password: string
}

type Props = {
  defaultIdentifier?: string
  loading?: boolean
  errorMessage?: string
  onSubmit?: (data: LoginData) => Promise<void> | void
}

export default function LoginForm({ defaultIdentifier = "", loading = false, errorMessage = "", onSubmit }: Props) {
  const idPrefix = useId()
  const [identifier, setIdentifier] = useState(defaultIdentifier)
  const [password, setPassword] = useState("")
  const [localLoading, setLocalLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(errorMessage || null)
  const [showPassword, setShowPassword] = useState(false)

  const submitting = loading || localLoading

  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({})

  function validate(): boolean {
    const errs: { identifier?: string; password?: string } = {}
    const id = identifier.trim()
    const pw = password

    if (!id) {
      errs.identifier = "必須項目です。"
    } else if (id.includes("@")) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(id)) errs.identifier = "有効なメールアドレスを入力してください。"
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
        await onSubmit({ identifier, password })
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
        <label className={styles.label} htmlFor={`${idPrefix}-identifier`}>メールアドレス または ユーザー名</label>
        <input
          className={styles.input}
          id={`${idPrefix}-identifier`}
          name="identifier"
          type="text"
          value={identifier}
          onChange={(e) => { setIdentifier(e.target.value); setFieldErrors((s) => ({ ...s, identifier: undefined })) }}
          required
          aria-invalid={!!fieldErrors.identifier}
          aria-describedby={fieldErrors.identifier ? `${idPrefix}-identifier-error` : undefined}
          autoComplete="username"
        />
        {fieldErrors.identifier && (
          <div id={`${idPrefix}-identifier-error`} role="alert" className={styles.fieldError}>
            {fieldErrors.identifier}
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
