"use client"

import React from "react"
import Link from "next/link"
import { type Article } from "../lib/types"
import styles from "../styles/search_list.module.css"

// ──────────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────────

type Props = {
  articles: Article[]
  loading: boolean
  error: string | null
  /** 現在のページ番号（1始まり） */
  page: number
  /** 総ページ数 */
  totalPages: number
  onPageChange: (page: number) => void
}

// ──────────────────────────────────────────────
// サブコンポーネント: 検索結果カード
// ──────────────────────────────────────────────

function ResultCard({ article }: { article: Article }) {
  return (
    <article className={styles.resultCard}>
      <Link href={`/article_detail?id=${encodeURIComponent(String(article.id))}`} className={styles.resultCardLink}>
        {article.title}
      </Link>

      {article.excerpt && (
        <p className={styles.resultCardExcerpt}>{article.excerpt}</p>
      )}

      {article.tags && article.tags.length > 0 && (
        <div className={styles.tagChipList}>
          {article.tags.map((tag) => (
            <span key={tag} className={styles.tagChip}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.resultCardMeta}>
        {article.author && <span>投稿者: {article.author}</span>}
        {article.publishedAt && (
          <span>
            {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
          </span>
        )}
      </div>
    </article>
  )
}

// ──────────────────────────────────────────────
// サブコンポーネント: ページネーション
// ──────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i)
  }

  return (
    <nav className={styles.pagination} aria-label="ページネーション">
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="前のページ"
      >
        ＜
      </button>

      {pages[0] > 1 && (
        <>
          <button className={styles.pageButton} onClick={() => onPageChange(1)}>1</button>
          {pages[0] > 2 && <span className={styles.pageInfo}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`${styles.pageButton} ${p === page ? styles.pageButtonActive : ""}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className={styles.pageInfo}>…</span>}
          <button className={styles.pageButton} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className={styles.pageButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="次のページ"
      >
        ＞
      </button>
    </nav>
  )
}

// ──────────────────────────────────────────────
// メインコンポーネント: SearchResultList
// ──────────────────────────────────────────────

export default function SearchResultList({
  articles,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
}: Props) {
  if (loading) {
    return <p className={styles.loadingText}>検索中...</p>
  }

  if (error) {
    return <p className={styles.errorText}>{error}</p>
  }

  if (articles.length === 0) {
    return <p className={styles.emptyText}>検索結果がありません。キーワードを変えてお試しください。</p>
  }

  return (
    <>
      <div className={styles.resultList}>
        {articles.map((article) => (
          <ResultCard key={article.id} article={article} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  )
}
