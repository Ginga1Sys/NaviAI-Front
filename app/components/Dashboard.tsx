"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import QuickTags from "./QuickTags"
import fetcher from "../lib/fetcher"
import styles from "../styles/dashboard.module.css"

// ──────────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────────

type Article = {
  id: number | string
  title: string
  excerpt?: string
  author?: string
  publishedAt?: string
}

type SummaryData = {
  pendingCount?: number
  weeklyNew?: number
  weeklyComments?: number
  weeklyLikes?: number
}

type ArticleApiResponse = {
  content?: Article[]
  data?: Article[]
} | Article[]

// ──────────────────────────────────────────────
// サブコンポーネント: 記事カード
// ──────────────────────────────────────────────

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className={styles.articleCard}>
      <Link href={`/knowledge/${article.id}`} className={styles.articleCardLink}>
        {article.title}
      </Link>
      {article.excerpt && (
        <p className={styles.articleCardExcerpt}>{article.excerpt}</p>
      )}
      <div className={styles.articleCardMeta}>
        {article.author && <span>作成者: {article.author}</span>}
        {article.publishedAt && (
          <span>{new Date(article.publishedAt).toLocaleDateString("ja-JP")}</span>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// メインコンポーネント: Dashboard
// ──────────────────────────────────────────────

export default function Dashboard() {
  const [activeMode, setActiveMode] = useState<"latest" | "recommended">("latest")

  // 記事データ
  const [latestArticle, setLatestArticle] = useState<Article | null>(null)
  const [recommendedArticle, setRecommendedArticle] = useState<Article | null>(null)
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [articlesError, setArticlesError] = useState<string | null>(null)

  // サマリーデータ
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  // 記事取得
  useEffect(() => {
    let cancelled = false
    async function loadArticles() {
      try {
        const [latestRes, recommendedRes] = await Promise.all([
          fetcher<ArticleApiResponse>("/api/v1/knowledge?sort=publishedAt,desc&size=1"),
          fetcher<ArticleApiResponse>("/api/v1/knowledge?sort=views,desc&size=1"),
        ])
        if (cancelled) return
        const toFirst = (res: ArticleApiResponse): Article | null => {
          const arr = Array.isArray(res)
            ? res
            : (res as { content?: Article[]; data?: Article[] }).content ??
              (res as { content?: Article[]; data?: Article[] }).data ??
              []
          return arr[0] ?? null
        }
        setLatestArticle(toFirst(latestRes))
        setRecommendedArticle(toFirst(recommendedRes))
      } catch {
        if (!cancelled) setArticlesError("記事の取得に失敗しました。")
      } finally {
        if (!cancelled) setArticlesLoading(false)
      }
    }
    loadArticles()
    return () => { cancelled = true }
  }, [])

  // サマリー取得
  useEffect(() => {
    let cancelled = false
    async function loadSummary() {
      try {
        const res = await fetcher<SummaryData>("/api/v1/summary")
        if (!cancelled) setSummary(res)
      } catch {
        // サマリー取得失敗はサイレント
      } finally {
        if (!cancelled) setSummaryLoading(false)
      }
    }
    loadSummary()
    return () => { cancelled = true }
  }, [])

  const displayArticle = activeMode === "latest" ? latestArticle : recommendedArticle

  return (
    <div className={styles.container}>

      {/* ── 左ナビ ── */}
      <nav className={styles.leftNav} aria-label="サイドナビゲーション">
        <Link href="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>ダッシュボード</Link>
        <Link href="/dashboard/knowledge" className={styles.navItem}>ナレッジ</Link>
        <Link href="/dashboard/review" className={styles.navItem}>承認</Link>
        <Link href="/my_post_list" className={styles.navItem}>投稿一覧</Link>
      </nav>

      {/* ── メインコンテンツ ── */}
      <main className={styles.main} id="main-content">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>ダッシュボード</h1>
        </div>

        {/* クイック操作ボタン */}
        <div className={styles.quickActions}>
          <button
            type="button"
            className={`${styles.quickActionBtn} ${activeMode === "latest" ? styles.quickActionBtnActive : ""}`}
            onClick={() => setActiveMode("latest")}
            aria-pressed={activeMode === "latest"}
          >
            新着
          </button>
          <button
            type="button"
            className={`${styles.quickActionBtn} ${activeMode === "recommended" ? styles.quickActionBtnActive : ""}`}
            onClick={() => setActiveMode("recommended")}
            aria-pressed={activeMode === "recommended"}
          >
            おすすめ
          </button>
        </div>

        {/* 記事表示エリア */}
        <section aria-labelledby="section-articles">
          <h2 className={styles.sectionTitle} id="section-articles">
            {activeMode === "latest" ? "新着記事" : "おすすめ記事"}
          </h2>
          {articlesLoading && <p className={styles.loadingText}>記事を読み込み中...</p>}
          {articlesError && <p className={styles.errorText}>{articlesError}</p>}
          {!articlesLoading && !articlesError && (
            displayArticle
              ? <ArticleCard article={displayArticle} />
              : <p className={styles.loadingText}>記事がありません。</p>
          )}
        </section>

        {/* タグ一覧 */}
        <section aria-labelledby="section-tags">
          <h2 className={styles.sectionTitle} id="section-tags">タグから探す</h2>
          <QuickTags />
        </section>
      </main>

      {/* ── 右サイドバー ── */}
      <aside className={styles.right} aria-label="サマリーウィジェット">

        {/* 承認待ち */}
        <div className={styles.sidebarCard}>
          <h2 className={styles.sidebarTitle}>承認待ち</h2>
          {summaryLoading
            ? <p className={styles.loadingText}>読み込み中...</p>
            : <p className={styles.pendingCount}>
                {summary?.pendingCount ?? "—"}
                <span className={styles.pendingUnit}>　件</span>
              </p>
          }
        </div>

        {/* 週次アクティビティ */}
        <div className={styles.sidebarCard}>
          <h2 className={styles.sidebarTitle}>週次アクティビティ</h2>
          {summaryLoading
            ? <p className={styles.loadingText}>読み込み中...</p>
            : (
              <ul className={styles.statList}>
                <li className={styles.statItem}>
                  <span>新着</span>
                  <span className={styles.statValue}>{summary?.weeklyNew ?? "—"}</span>
                </li>
                <li className={styles.statItem}>
                  <span>コメント</span>
                  <span className={styles.statValue}>{summary?.weeklyComments ?? "—"}</span>
                </li>
                <li className={styles.statItem}>
                  <span>いいね</span>
                  <span className={styles.statValue}>{summary?.weeklyLikes ?? "—"}</span>
                </li>
              </ul>
            )
          }
        </div>

      </aside>
    </div>
  )
}

