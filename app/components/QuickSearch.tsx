"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import fetcher from "../lib/fetcher"
import { type Article, type ListApiResponse, normalizeListResponse } from "../lib/types"
import quickSearchStyles from "./QuickSearch.module.css"

/** GET /api/v1/knowledge のレスポンス型（配列要素） */
type KnowledgeItem = Article

type ApiResponse = ListApiResponse<KnowledgeItem>

/** サジェスト付きクイック検索コンポーネント */
export default function QuickSearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<KnowledgeItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // クリックアウトサイドでサジェストを閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // デバウンスでサジェスト取得
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetcher<ApiResponse>(
          `/api/v1/knowledge?q=${encodeURIComponent(query.trim())}&size=5`
        )
        const items = normalizeListResponse(res)
        setSuggestions(items)
        setOpen(items.length > 0)
      } catch (err: unknown) {
        setError("検索に失敗しました。")
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search_list?q=${encodeURIComponent(query.trim())}`)
    setOpen(false)
  }

  function handleSelect(item: KnowledgeItem) {
    router.push(`/article_detail?id=${encodeURIComponent(String(item.id))}`)
    setOpen(false)
    setQuery("")
  }

  return (
    <div ref={wrapRef} className={quickSearchStyles.wrap}>
      <form onSubmit={handleSubmit} role="search" aria-label="ナレッジ検索" className={quickSearchStyles.form}>
        <span className={quickSearchStyles.icon} aria-hidden="true">🔍</span>
        <input
          className={quickSearchStyles.input}
          type="search"
          placeholder="ナレッジを検索…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          aria-label="ナレッジ検索"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="qs-suggestions"
          autoComplete="off"
        />
        {loading && <span className={quickSearchStyles.spinner} aria-label="検索中" />}
        {query && (
          <button
            type="button"
            className={quickSearchStyles.clearBtn}
            onClick={() => { setQuery(""); setSuggestions([]); setOpen(false) }}
            aria-label="クリア"
          >✕</button>
        )}
        <button type="submit" className={quickSearchStyles.searchBtn}>検索</button>
      </form>

      {error && <p className={quickSearchStyles.error}>{error}</p>}

      {open && (
        <ul
          id="qs-suggestions"
          role="listbox"
          className={quickSearchStyles.dropdown}
          aria-label="サジェスト一覧"
        >
          {suggestions.map((item) => (
            <li
              key={item.id}
              role="option"
              aria-selected={false}
              className={quickSearchStyles.dropdownItem}
              onMouseDown={() => handleSelect(item)}
            >
              <span className={quickSearchStyles.dropdownIcon} aria-hidden="true">📄</span>
              <span className={quickSearchStyles.dropdownTitle}>{item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
