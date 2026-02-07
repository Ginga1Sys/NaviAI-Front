"use client"

import { ReviewItem } from "../mockData"
import styles from "../styles.module.css"

export type ReviewListProps = {
  items: ReviewItem[]
  activeId?: string
  selectedIds: Set<string>
  onSelectRow: (itemId: string) => void
  onToggleSelected: (itemId: string) => void
}

export function ReviewList({
  items,
  activeId,
  selectedIds,
  onSelectRow,
  onToggleSelected,
}: ReviewListProps) {
  return (
    <section aria-label="承認待ち一覧" className={styles.card}>
      <header>
        <h2>承認待ち一覧</h2>
        <p className="sr-only">チェックで対象を選択し、クリックで詳細を表示</p>
      </header>
      <div role="list" aria-live="polite">
        {items.map((item) => {
          const isActive = item.id === activeId
          const isChecked = selectedIds.has(item.id)
          const badgeClass =
            item.status === "published"
              ? styles.badgePublished
              : item.status === "declined"
              ? styles.badgeDeclined
              : styles.badgePending

          return (
            <article
              key={item.id}
              role="listitem"
              tabIndex={0}
              aria-selected={isActive}
              className={`${styles.reviewItem} ${isActive ? styles.reviewItemActive : ""}`}
              onClick={() => onSelectRow(item.id)}
              onKeyDown={(evt) => {
                if (evt.key === "Enter" || evt.key === " ") {
                  evt.preventDefault()
                  onSelectRow(item.id)
                }
              }}
            >
              <input
                type="checkbox"
                className={styles.reviewCheckbox}
                aria-label={`${item.title} を一括操作対象に追加`}
                checked={isChecked}
                onChange={(evt) => {
                  evt.stopPropagation()
                  onToggleSelected(item.id)
                }}
                onClick={(evt) => evt.stopPropagation()}
              />
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{item.title}</p>
                <p style={{ margin: "4px 0", color: "#4b5563" }}>
                  {item.summary} — 投稿者: {item.author}
                </p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
                  提出: {new Date(item.submittedAt).toLocaleString("ja-JP")}
                </p>
              </div>
              <span className={`${styles.badge} ${badgeClass}`}>
                {item.status === "published"
                  ? "Published"
                  : item.status === "declined"
                  ? "Declined"
                  : "Pending"}
              </span>
            </article>
          )
        })}
      </div>
    </section>
  )
}
