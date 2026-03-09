"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Sidebar from "./Sidebar"
import SearchResultList, { Article } from "./SearchResultList"
import SearchSidebar, { Tag } from "./SearchSidebar"
import fetcher from "../lib/fetcher"
import dashStyles from "../styles/dashboard.module.css"
import styles from "../styles/search_list.module.css"

// ──────────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────────

type KnowledgeApiResponse = {
  content?: Article[]
  data?: Article[]
  items?: Article[]
  totalElements?: number
  totalPages?: number
  total?: number
  totalCount?: number
} | Article[]

type TagApiResponse = {
  content?: Tag[]
  data?: Tag[]
} | Tag[]

const PAGE_SIZE = 20

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 1) return null
  return parsed
}

function normalizeType(value: string | null): "new" | "recommended" | null {
  if (value === "new" || value === "recommended") return value
  return null
}

// ──────────────────────────────────────────────
// メインコンポーネント: SearchResultView
// ──────────────────────────────────────────────

export default function SearchResultView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // クエリパラメータ
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "")
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const t = searchParams.get("tags")
    return t ? t.split(",").filter(Boolean) : []
  })
  const [type, setType] = useState<"new" | "recommended" | null>(
    normalizeType(searchParams.get("type")),
  )
  const [limit, setLimit] = useState<number | null>(
    parsePositiveInt(searchParams.get("limit")),
  )
  const [page, setPage] = useState<number>(() => {
    const p = parseInt(searchParams.get("page") ?? "1", 10)
    return isNaN(p) || p < 1 ? 1 : p
  })

  // 検索結果
  const [articles, setArticles] = useState<Article[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [articlesError, setArticlesError] = useState<string | null>(null)

  // タグ一覧
  const [tags, setTags] = useState<Tag[]>([])
  const [tagsLoading, setTagsLoading] = useState(true)

  // URL クエリ更新時（戻る/進む等）にローカル状態へ同期する
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
    setInputValue(searchParams.get("q") ?? "")
    const t = searchParams.get("tags")
    setSelectedTags(t ? t.split(",").filter(Boolean) : [])
    setType(normalizeType(searchParams.get("type")))
    setLimit(parsePositiveInt(searchParams.get("limit")))
    const p = parseInt(searchParams.get("page") ?? "1", 10)
    setPage(isNaN(p) || p < 1 ? 1 : p)
  }, [searchParams])

  // ── URL を更新してクエリパラメータを反映する ──
  const pushUrl = useCallback(
    (newQuery: string, newTags: string[], newPage: number) => {
      const params = new URLSearchParams()
      if (newQuery.trim()) params.set("q", newQuery.trim())
      if (newTags.length > 0) params.set("tags", newTags.join(","))
      if (newPage > 1) params.set("page", String(newPage))
      const qs = params.toString()
      router.push(`/search_list${qs ? `?${qs}` : ""}`)
    },
    [router],
  )

  // ── 検索 API 呼び出し ──
  useEffect(() => {
    let cancelled = false
    async function loadArticles() {
      setArticlesLoading(true)
      setArticlesError(null)
      try {
        const params = new URLSearchParams()
        if (query.trim()) params.set("q", query.trim())
        if (selectedTags.length > 0) params.set("tags", selectedTags.join(","))
        if (type === "new") params.set("filter", "latest")
        if (type === "recommended") params.set("filter", "recommended")

        const pageSize = limit ?? PAGE_SIZE
        params.set("page", String(page - 1)) // API は 0-indexed ページネーションを想定
        params.set("size", String(pageSize))

        const res = await fetcher<KnowledgeApiResponse>(
          `/api/v1/knowledge?${params.toString()}`
        )

        if (cancelled) return

        if (Array.isArray(res)) {
          setArticles(res)
          setTotalCount(res.length)
          setTotalPages(1)
        } else {
          const items =
            (res as { content?: Article[]; data?: Article[] }).content ??
            (res as { content?: Article[]; data?: Article[] }).data ??
            (res as { items?: Article[] }).items ??
            []
          setArticles(items)

          const total =
            (res as { totalElements?: number }).totalElements ??
            (res as { total?: number }).total ??
            (res as { totalCount?: number }).totalCount ??
            items.length
          setTotalCount(total)
          setTotalPages(
            (res as { totalPages?: number }).totalPages ??
            (Math.ceil(total / pageSize) || 1)
          )
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setArticlesError("検索結果の取得に失敗しました。しばらく後で再試行してください。")
        }
      } finally {
        if (!cancelled) setArticlesLoading(false)
      }
    }
    loadArticles()
    return () => { cancelled = true }
  }, [query, selectedTags, page, type, limit])

  // ── タグ一覧 API 呼び出し ──
  useEffect(() => {
    let cancelled = false
    async function loadTags() {
      try {
        const res = await fetcher<TagApiResponse>("/api/v1/tags")
        if (cancelled) return
        const items: Tag[] = Array.isArray(res)
          ? res
          : (res as { content?: Tag[]; data?: Tag[] }).content ??
            (res as { content?: Tag[]; data?: Tag[] }).data ??
            []
        setTags(items)
      } catch {
        // タグ取得失敗はサイレントに処理
      } finally {
        if (!cancelled) setTagsLoading(false)
      }
    }
    loadTags()
    return () => { cancelled = true }
  }, [])

  // ── イベントハンドラ ──

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newQuery = inputValue.trim()
    setQuery(newQuery)
    setPage(1)
    pushUrl(newQuery, selectedTags, 1)
  }

  function handleTagClick(tagName: string) {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName]
    setSelectedTags(newTags)
    setPage(1)
    pushUrl(query, newTags, 1)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    pushUrl(query, selectedTags, newPage)
    // ページ変更時にスクロール位置をトップへ戻す
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ── レンダリング ──

  return (
    <div className={dashStyles.container}>
      {/* ── 左ナビ（共通 Sidebar コンポーネント） ── */}
      <Sidebar activeItem="knowledge" />

      {/* ── コンテンツエリア（main + 右サイドバー） ── */}
      <div className={dashStyles.contentArea}>
        <main className={dashStyles.main} id="main-content">
          {/* ページヘッダー */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>検索結果</h1>
            {query && (
              <p className={styles.queryLabel}>
                「<span className={styles.queryText}>{query}</span>」の検索結果
                {selectedTags.length > 0 && (
                  <> &nbsp;／&nbsp; タグ: {selectedTags.join(", ")}</>
                )}
              </p>
            )}
            {!query && type === "new" && (
              <p className={styles.queryLabel}>新着記事の一覧を表示しています。</p>
            )}
            {!query && type === "recommended" && (
              <p className={styles.queryLabel}>おすすめ記事の一覧を表示しています。</p>
            )}
          </div>

          {/* 検索バー */}
          <form
            className={styles.searchBarForm}
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="記事検索"
          >
            <input
              type="search"
              className={styles.searchInput}
              placeholder="キーワードを入力して検索…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="検索キーワード"
            />
            <button type="submit" className={styles.searchButton}>
              検索
            </button>
          </form>

          {/* 検索結果リスト */}
          <section aria-labelledby="section-results">
            <h2 className={dashStyles.sectionTitle} id="section-results">
              {articlesLoading
                ? "検索中..."
                : totalCount !== null
                ? `${totalCount.toLocaleString("ja-JP")} 件の結果`
                : "検索結果"}
            </h2>
            <SearchResultList
              articles={articles}
              loading={articlesLoading}
              error={articlesError}
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </section>
        </main>

        {/* ── 右サイドバー ── */}
        <aside className={dashStyles.right} aria-label="検索サイドバー">
          <SearchSidebar
            totalCount={articlesLoading ? null : totalCount}
            tags={tags}
            tagsLoading={tagsLoading}
            selectedTags={selectedTags}
            onTagClick={handleTagClick}
          />
        </aside>
      </div>
    </div>
  )
}
