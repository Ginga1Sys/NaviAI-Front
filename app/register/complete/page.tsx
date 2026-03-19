import React from "react"
import Link from "next/link"
import styles from "../../pages/login/login.module.css"
import pageStyles from "../status.module.css"

export default function RegisterCompletePage() {
  return (
    <div className={styles.container}>
      <div className={styles.centerCard}>
        <div className={styles.cardTop}>
          <div className={styles.headerIllustration} aria-hidden="true" />
          <div className={styles.cardTitle}>team sharing</div>
        </div>

        <div className={styles.cardBody}>
          <h1 className={styles.pageHeading}>登録完了</h1>

          <div className={pageStyles.statusCard}>
            <div className={pageStyles.icon} aria-hidden="true">✅</div>
            <p className={pageStyles.message}>
              アカウントの登録が完了しました。
              <br />
              ログイン画面からサービスをご利用ください。
            </p>
          </div>

          <div className={styles.helpBox}>
            <div>アカウントの準備ができました。</div>
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
