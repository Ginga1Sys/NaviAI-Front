"use client"

import React from "react"
import styles from "../styles/search_list.module.css"

// ──────────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────────

export type Tag = {
  id?: number | string
  name: string
  count?: number
}

type Props = {
  /** 検索結果の総件数 */
  totalCount: number | null
  /** タグ一覧データ */
  tags: Tag[]
  /** タグロード中フラグ */
  tagsLoading: boolean
  /** 現在選択中のタグ名一覧 */
  selectedTags: string[]
  /** タグクリック時のコールバック */
  onTagClick: (tagName: string) => void
}

// ──────────────────────────────────────────────
// メインコンポーネント: SearchSidebar
// ──────────────────────────────────────────────

export default function SearchSidebar({
  totalCount,
  tags,
  tagsLoading,
  selectedTags,
  onTagClick,
}: Props) {
  return (
    <>
      {/* 検索結果件数 */}
      <div className={styles.sidebarCard}>
        <h2 className={styles.sidebarTitle}>検索結果</h2>
        <p className={styles.totalCount}>
          {totalCount !== null ? totalCount.toLocaleString("ja-JP") : "—"}
          <span className={styles.totalCountUnit}>　件</span>
        </p>
      </div>

      {/* タグ一覧 */}
      <div className={styles.sidebarCard}>
        <h2 className={styles.sidebarTitle}>タグから絞り込む</h2>

        {tagsLoading && (
          <p className={styles.loadingText}>タグを読み込み中...</p>
        )}

        {!tagsLoading && tags.length === 0 && (
          <p className={styles.loadingText}>タグがありません。</p>
        )}

        {!tagsLoading && tags.length > 0 && (
          <ul className={styles.tagList}>
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name)
              return (
                <li key={tag.id ?? tag.name} className={styles.tagItem}>
                  <button
                    type="button"
                    className={`${styles.tagButton} ${isSelected ? styles.tagButtonSelected : ""}`}
                    onClick={() => onTagClick(tag.name)}
                    aria-pressed={isSelected}
                  >
                    {tag.name}
                    {tag.count !== undefined && (
                      <span className={styles.tagCount}>({tag.count})</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
