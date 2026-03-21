"use client"

import React from "react"
import Link from "next/link"
import styles from "../../pages/login/login.module.css"
import pageStyles from "../status.module.css"

export default function MailSentPage() {
  return (
    <div className={styles.container}>
      <div className={styles.centerCard}>
        <div className={styles.cardTop}>
          <div className={styles.headerIllustration} aria-hidden="true" />
          <div className={styles.cardTitle}>team sharing</div>
        </div>

        <div className={styles.cardBody}>
          <h1 className={styles.pageHeading}>確認メールを送信しました</h1>

          <div className={pageStyles.statusCard}>
            <div className={pageStyles.icon} aria-hidden="true">✉</div>
            <p className={pageStyles.message}>
              ご入力いただいたメールアドレスに確認メールを送信しました。
              <br />
              メール内のリンクをクリックして、アカウント登録を完了してください。
            </p>
            <div className={pageStyles.hint}>
              <strong>メールが届かない場合</strong>
              <ul className={pageStyles.hintList}>
                <li>迷惑メールフォルダをご確認ください。</li>
                <li>メールアドレスに誤りがないかご確認の上、再登録をお試しください。</li>
              </ul>
            </div>
          </div>

          <div className={styles.helpBox}>
            <div>アカウントをお持ちの方は</div>
            <div className={styles.helpSub}>
              <Link href="/login" className={styles.helpLink}>
                ログインはこちら
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
