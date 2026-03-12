"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import styles from "../../pages/login/login.module.css"
import pageStyles from "../status.module.css"

function RegisterFailedContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason")

  const reasonMessage =
    reason === "expired"
      ? "確認リンクの有効期限が切れています。再度ご登録いただき、メール内のリンクを早めにクリックしてください。"
      : "確認リンクが無効です。リンクが正しいか確認するか、再度ご登録をお試しください。"

  return (
    <div className={styles.container}>
      <div className={styles.centerCard}>
        <div className={styles.cardTop}>
          <div className={styles.headerIllustration} aria-hidden="true" />
          <div className={styles.cardTitle}>team sharing</div>
        </div>

        <div className={styles.cardBody}>
          <h1 className={styles.pageHeading}>登録に失敗しました</h1>

          <div className={`${pageStyles.statusCard} ${pageStyles.statusCardError}`}>
            <div className={pageStyles.icon} aria-hidden="true">❌</div>
            <p className={pageStyles.message}>{reasonMessage}</p>
          </div>

          <div className={styles.helpBox}>
            <div>もう一度お試しください。</div>
            <div className={styles.helpSub}>
              <Link href="/register" className={styles.helpLink}>
                会員登録に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterFailedPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          読み込み中…
        </div>
      }
    >
      <RegisterFailedContent />
    </Suspense>
  )
}
