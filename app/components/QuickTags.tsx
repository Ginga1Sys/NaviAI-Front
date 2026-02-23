"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import fetcher from "../lib/fetcher"
import quickTagsStyles from "./QuickTags.module.css"

/** GET /api/v1/tags のレスポンス型（配列要素） */
type Tag = {
  id: number | string
  name: string
  count?: number
}

type ApiResponse = {
  content?: Tag[]
  data?: Tag[]
} | Tag[]

/** クイック操作（タグ一覧）コンポーネント */
export default function QuickTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetcher<ApiResponse>("/api/v1/tags")
        if (cancelled) return
        const items: Tag[] = Array.isArray(res)
          ? res
          : (res as { content?: Tag[]; data?: Tag[] }).content ??
            (res as { content?: Tag[]; data?: Tag[] }).data ??
            []
        setTags(items)
      } catch (err: unknown) {
        if (!cancelled) setError("タグの取得に失敗しました。")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  function handleTagClick(tag: Tag) {
    router.push(`/search?tag=${encodeURIComponent(tag.name)}`)
  }

  return (
    <div className={quickTagsStyles.wrap}>
      {loading && <p className={quickTagsStyles.loading}>タグを読み込み中...</p>}
      {error && <p className={quickTagsStyles.error}>{error}</p>}
      {!loading && !error && tags.length === 0 && (
        <p className={quickTagsStyles.empty}>タグがありません。</p>
      )}
      {!loading && tags.length > 0 && (
        <ul className={quickTagsStyles.tagList} aria-label="タグ一覧">
          {tags.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                className={quickTagsStyles.tagChip}
                onClick={() => handleTagClick(tag)}
                aria-label={`タグ: ${tag.name}`}
              >
                <span className={quickTagsStyles.tagHash}>#</span>
                {tag.name}
                {tag.count != null && (
                  <span className={quickTagsStyles.tagCount}>{tag.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
