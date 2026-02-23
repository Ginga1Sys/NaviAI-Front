"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../styles/dashboard.module.css'

export type SidebarActiveItem =
  | 'dashboard'
  | 'knowledge'
  | 'my_post_list'
  | 'review'
  | 'admin'

type Props = {
  activeItem?: SidebarActiveItem
}

export default function Sidebar({ activeItem = 'dashboard' }: Props) {
  const [open, setOpen] = useState(true)

  // localStorage は SSR では使えないため useEffect で初期化
  useEffect(() => {
    try {
      const v = localStorage.getItem('leftNavOpen')
      setOpen(v === null ? true : v === '1')
    } catch {
      // localStorage が使えない環境では開いた状態をデフォルトとする
    }
  }, [])

  const toggle = () => {
    setOpen(prev => {
      const next = !prev
      try { localStorage.setItem('leftNavOpen', next ? '1' : '0') } catch {}
      return next
    })
  }

  return (
    <nav
      className={open ? styles.leftNav : `${styles.leftNav} ${styles.leftNavCollapsed}`}
      aria-label="サイドナビゲーション"
    >
      {/* ブランド行：常に表示 */}
      <div className={styles.leftBrand}>
        {open && <span className={styles.brandText}>Ginga</span>}
        <button
          aria-expanded={open}
          aria-label={open ? 'サイドバーを閉じる' : 'サイドバーを開く'}
          className={styles.sidebarToggleButton}
          onClick={toggle}
        >
          ☰
        </button>
      </div>

      {/* ナビリンク：開いているときのみ表示 */}
      {open && (
        <>
          <Link
            href="/dashboard"
            className={`${styles.navItem} ${activeItem === 'dashboard' ? styles.navItemActive : ''}`}
          >
            ダッシュボード
          </Link>
          <Link
            href="/dashboard/knowledge"
            className={`${styles.navItem} ${activeItem === 'knowledge' ? styles.navItemActive : ''}`}
          >
            ナレッジ
          </Link>
          <Link
            href="/my_post_list"
            className={`${styles.navItem} ${activeItem === 'my_post_list' ? styles.navItemActive : ''}`}
          >
            投稿一覧
          </Link>
          <Link
            href="/dashboard/review"
            className={`${styles.navItem} ${activeItem === 'review' ? styles.navItemActive : ''}`}
          >
            承認
          </Link>
          <Link
            href="/admin"
            className={`${styles.navItem} ${activeItem === 'admin' ? styles.navItemActive : ''}`}
          >
            管理者パネル
          </Link>
          <Link href="/posts/new" className={styles.newPostButton}>
            ＋ 新規投稿
          </Link>
        </>
      )}
    </nav>
  )
}
