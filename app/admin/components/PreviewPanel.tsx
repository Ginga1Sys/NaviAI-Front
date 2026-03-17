"use client"

import { ReviewItem } from "../mockData"
import styles from "../styles.module.css"

export type PreviewPanelProps = {
  item?: ReviewItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function PreviewPanel({ item, onApprove, onReject }: PreviewPanelProps) {
  if (!item) {
    return (
      <section aria-label="投稿プレビュー" className={styles.card}>
        <p>一覧から投稿を選択すると詳細が表示されます。</p>
      </section>
    )
  }

  return (
    <section aria-label="投稿プレビュー" className={styles.card}>
      <header className={styles.previewHeader}>
        <h2>{item.title}</h2>
        <p>
          投稿者: {item.author} ／ カテゴリ: {item.category}
        </p>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          ステータス: Pending ／ 提出: {new Date(item.submittedAt).toLocaleString("ja-JP")}
        </p>
      </header>
      <div className={styles.previewBody}>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            margin: 0,
            fontFamily: "'IBM Plex Mono', Consolas, monospace",
            fontSize: "0.95rem",
          }}
        >
          {item.markdownPreview}
        </pre>
      </div>
      <div className={styles.previewActions}>
        <button
          type="button"
          className={styles.btnApprove}
          onClick={() => onApprove(item.id)}
        >
          承認
        </button>
        <button
          type="button"
          className={styles.btnReject}
          onClick={() => onReject(item.id)}
        >
          却下
        </button>
      </div>
    </section>
  )
}