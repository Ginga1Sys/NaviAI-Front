"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import RegisterForm from "../components/RegisterForm"
import styles from "../pages/login/login.module.css"

export default function RegisterPage() {
  const router = useRouter()

  function handleSuccess() {
    // 登録成功後はメール送信完了画面へ遷移
    router.push("/register/mail-sent")
  }

  return (
    <div className={styles.container}>
      <div className={styles.centerCard}>
        <div className={styles.cardTop}>
          <div className={styles.headerIllustration} aria-hidden="true" />
          <div className={styles.cardTitle}>team sharing</div>
        </div>

        <div className={styles.cardBody}>
          <h1 className={styles.pageHeading}>会員登録</h1>

          <div className={styles.formWrap}>
            <RegisterForm onSuccess={handleSuccess} />
          </div>

          <div className={styles.helpBox}>
            <div>すでにアカウントをお持ちですか？</div>
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
