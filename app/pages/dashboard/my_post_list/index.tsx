"use client"

import React, { useEffect, useState } from 'react'
import styles from './my_post_list.module.css'
import { getMockPosts, Post } from '../../../lib/mockPosts'
import MyPostList from '../../../components/MyPostList'
import Link from 'next/link'

export default function MyPostListPage() {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('すべて');

  useEffect(() => {
    let mounted = true
    getMockPosts().then((data) => {
      if (!mounted) return
      setPosts(data)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  const filteredPosts = posts?.filter(post => {
    if (filter === 'すべて') return true;
    return post.status === filter;
  });

  if (loading) return <div className={styles.loading}>読み込み中…</div>

  return (
    <div className={styles.container}>
      <nav className={styles.leftNav}>
        {/* サイドナビゲーションのアイテム */}
        <Link href="#" className={styles.navItem}>ダッシュボード</Link>
        <Link href="#" className={styles.navItem}>ナレッジ</Link>
        <Link href="#" className={styles.navItem}>承認</Link>
        <Link href="#" className={`${styles.navItem} ${styles.navItemActive}`}>投稿一覧</Link>
      </nav>
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>マイ投稿</h1>
          <button>新規作成</button>
        </div>
        <div className={styles.tabs}>
          <button onClick={() => setFilter('すべて')} className={filter === 'すべて' ? styles.tabActive : styles.tab}>すべて</button>
          <button onClick={() => setFilter('公開')} className={filter === '公開' ? styles.tabActive : styles.tab}>公開</button>
          <button onClick={() => setFilter('下書き')} className={filter === '下書き' ? styles.tabActive : styles.tab}>下書き</button>
          <button onClick={() => setFilter('レビュー中')} className={filter === 'レビュー中' ? styles.tabActive : styles.tab}>レビュー中</button>
          <button onClick={() => setFilter('差し戻し')} className={filter === '差し戻し' ? styles.tabActive : styles.tab}>差し戻し</button>
        </div>
        {!filteredPosts || filteredPosts.length === 0 ? (
          <div className={styles.empty}>投稿はありません。</div>
        ) : (
          <MyPostList posts={filteredPosts} />
        )}
      </main>
      <aside className={styles.right}>
        <div className={styles.sidebarCard}>
          <h2 className={styles.sidebarTitle}>マイ統計</h2>
          <ul className={styles.statList}>
            <li className={styles.statItem}><span>総投稿</span><span className={styles.statValue}>24</span></li>
            <li className={styles.statItem}><span>下書き</span><span className={styles.statValue}>8</span></li>
            <li className={styles.statItem}><span>公開申請中</span><span className={styles.statValue}>3</span></li>
            <li className={styles.statItem}><span>公開済み</span><span className={styles.statValue}>12</span></li>
            <li className={styles.statItem}><span>差し戻し</span><span className={styles.statValue}>1</span></li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
