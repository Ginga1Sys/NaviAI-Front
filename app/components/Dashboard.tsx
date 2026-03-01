"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Sidebar from "./Sidebar"
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
  totalPosts?: number
  weeklyPosts?: number
  pendingApprovals?: number
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
  // 記事データ
  const [recommendedArticle, setRecommendedArticle] = useState<Article | null>(null)
  const [latestArticles, setLatestArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [articlesError, setArticlesError] = useState<string | null>(null)

  // サマリーデータ
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // 管理者判定（localStorage から currentUser を読み取り）
  useEffect(() => {
    try {
      const userJson = localStorage.getItem('currentUser')
      if (userJson) {
        const user = JSON.parse(userJson)
        setIsAdmin(!!(user?.isAdmin || (user?.roles ?? []).includes('ADMIN')))
      }
    } catch {}
  }, [])

  // 記事取得
  useEffect(() => {
    let cancelled = false
    async function loadArticles() {
      try {
        const [latestRes, recommendedRes] = await Promise.all([
          fetcher<ArticleApiResponse>("/api/v1/knowledge?sort=publishedAt,desc&size=3"),
          fetcher<ArticleApiResponse>("/api/v1/knowledge?sort=views,desc&size=1"),
        ])
        if (cancelled) return
        const toArray = (res: ArticleApiResponse): Article[] => {
          if (Array.isArray(res)) return res
          return (
            (res as { content?: Article[]; data?: Article[] }).content ??
            (res as { content?: Article[]; data?: Article[] }).data ??
            []
          )
        }
        const recommendedArr = toArray(recommendedRes)
        setRecommendedArticle(recommendedArr[0] ?? null)
        setLatestArticles(toArray(latestRes).slice(0, 3))
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
        const res = await fetcher<SummaryData>("/api/v1/dashboard")
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

  return (
    <div className={styles.container}>

      {/* ── 左ナビ（共通 Sidebar コンポーネント） ── */}
      <Sidebar activeItem="dashboard" />

      {/* ── コンテンツエリア（main + 右サイドバー） ── */}
      <div className={styles.contentArea}>
      <main className={styles.main} id="main-content">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>ダッシュボード</h1>
        </div>

        {/* クイック操作ボタン */}
        <div className={styles.quickActions}>
          <Link
            href="/search_list?type=new&limit=20"
            className={styles.quickActionBtn}
          >
            新着記事
          </Link>
          <Link
            href="/search_list?type=recommended&limit=10"
            className={styles.quickActionBtn}
          >
            おすすめ記事
          </Link>
        </div>

        {/* おすすめ記事（1件・上段固定） */}
        <section aria-labelledby="section-recommended">
          <h2 className={styles.sectionTitle} id="section-recommended">おすすめ記事</h2>
          {articlesLoading && <p className={styles.loadingText}>記事を読み込み中...</p>}
          {articlesError && <p className={styles.errorText}>{articlesError}</p>}
          {!articlesLoading && !articlesError && (
            recommendedArticle
              ? <ArticleCard article={recommendedArticle} />
              : <p className={styles.loadingText}>記事がありません。</p>
          )}
        </section>

        {/* 新着記事（最大3件・下段） */}
        <section aria-labelledby="section-latest">
          <h2 className={styles.sectionTitle} id="section-latest">新着記事</h2>
          {articlesLoading && <p className={styles.loadingText}>記事を読み込み中...</p>}
          {articlesError && <p className={styles.errorText}>{articlesError}</p>}
          {!articlesLoading && !articlesError && (
            latestArticles.length > 0
              ? latestArticles.map((a) => <ArticleCard key={a.id} article={a} />)
              : <p className={styles.loadingText}>記事がありません。</p>
          )}
        </section>
      </main>

      {/* ── 右サイドバー ── */}
      <aside className={styles.right} aria-label="サマリーウィジェット">

        {/* 承認待ち（管理者のみ） */}
        {isAdmin && (
          <div className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>承認待ち</h2>
            {summaryLoading
              ? <p className={styles.loadingText}>読み込み中...</p>
              : <Link href="/admin/pending" className={styles.pendingCount} style={{ textDecoration: "none" }}>
                  {summary?.pendingApprovals ?? "—"}
                  <span className={styles.pendingUnit}>　件</span>
                </Link>
            }
          </div>
        )}

        {/* 週次アクティビティ（管理者のみ） */}
        {isAdmin && (
          <div className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>週次アクティビティ</h2>
            {summaryLoading
              ? <p className={styles.loadingText}>読み込み中...</p>
              : (
                <ul className={styles.statList}>
                  <li className={styles.statItem}>
                    <span>新着</span>
                    <span className={styles.statValue}>{summary?.weeklyPosts ?? "—"}</span>
                  </li>
                  <li className={styles.statItem}>
                    <span>総投稿数</span>
                    <span className={styles.statValue}>{summary?.totalPosts ?? "—"}</span>
                  </li>
                </ul>
              )
            }
          </div>
        )}

      </aside>
      </div>
    </div>
  )
}

