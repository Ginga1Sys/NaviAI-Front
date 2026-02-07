"use client"

import { useMemo, useState } from "react"
import { AdminSidebar } from "./components/AdminSidebar"
import { PreviewPanel } from "./components/PreviewPanel"
import { RejectModal } from "./components/RejectModal"
import { ReviewList } from "./components/ReviewList"
import { auditLogs, quickStats, reviewQueue } from "./mockData"
import styles from "./styles.module.css"

export default function AdminPanelPage() {
  const [items, setItems] = useState(reviewQueue)
  const [activeId, setActiveId] = useState(reviewQueue[0]?.id)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rejectModalItemId, setRejectModalItemId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [items, activeId])

  const pendingCount = selectedIds.size

  function handleToggleSelect(itemId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  function applyStatus(itemIds: Set<string>, status: "published" | "declined") {
    if (!itemIds.size) return
    setItems((prev) =>
      prev.map((item) => (itemIds.has(item.id) ? { ...item, status } : item)),
    )
    setSelectedIds(new Set())
  }

  function handleApprove(id: string) {
    applyStatus(new Set([id]), "published")
  }

  function handleReject(id: string) {
    setRejectModalItemId(id)
    setRejectReason("")
  }

  function handleBulkApprove() {
    applyStatus(selectedIds, "published")
  }

  function handleBulkReject() {
    if (!selectedIds.size) return
    setRejectModalItemId(Array.from(selectedIds)[0])
    setRejectReason("")
  }

  function confirmReject() {
    if (!rejectModalItemId) return
    const targetIds = selectedIds.size ? selectedIds : new Set([rejectModalItemId])
    applyStatus(targetIds, "declined")
    setRejectModalItemId(null)
    setRejectReason("")
  }

  return (
    <div className={styles.page}>
      <a href="#main" style={{ position: "absolute", left: -9999 }}>メインへスキップ</a>
      <header className={styles.topBar}>
        <div className={styles.searchBox}>
          <span role="img" aria-label="検索">
            🔍
          </span>
          <input type="search" placeholder="投稿タイトル・タグを検索" aria-label="投稿検索" />
        </div>
        <div aria-label="アカウント情報" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>admin_demo</span>
          <span role="img" aria-label="通知ベル">
            🔔
          </span>
        </div>
      </header>

      <div className={styles.shell}>
        <nav className={styles.sideNav} aria-label="管理者サイドナビ">
          <h1>Ginga Admin</h1>
          <div className={styles.navLinks}>
            {[
              "ダッシュボード",
              "ナレッジ",
              "承認",
              "ユーザー",
              "監査ログ",
            ].map((label) => (
              <button key={label} className={styles.navButton} data-active={label === "承認"}>
                {label}
              </button>
            ))}
          </div>
          <button className={styles.composeButton}>
            <span aria-hidden>＋</span> 新規投稿
          </button>
        </nav>

        <main id="main" className={styles.mainPanel} role="main" aria-label="管理者パネルメイン">
          <section className={styles.bulkBar} aria-label="フィルタと一括操作">
            <div>
              <strong>フィルタ</strong>
              <p style={{ margin: 0, color: "#6b7280" }}>ステータス、投稿者、タグ、提出日で絞り込み</p>
            </div>
            <div className={styles.bulkActions}>
              <button
                type="button"
                className={styles.btnApprove}
                onClick={handleBulkApprove}
                disabled={!pendingCount}
              >
                一括承認（{pendingCount}）
              </button>
              <button
                type="button"
                className={styles.btnReject}
                onClick={handleBulkReject}
                disabled={!pendingCount}
              >
                一括却下（{pendingCount}）
              </button>
            </div>
          </section>

          <div className={styles.columns}>
            <ReviewList
              items={items}
              activeId={activeId}
              selectedIds={selectedIds}
              onSelectRow={(id) => setActiveId(id)}
              onToggleSelected={handleToggleSelect}
            />
            <PreviewPanel
              item={activeItem}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        </main>

        <AdminSidebar stats={quickStats} auditLogs={auditLogs} />
      </div>

      <RejectModal
        isOpen={Boolean(rejectModalItemId)}
        title={
          items.find((item) => item.id === (rejectModalItemId || activeId))?.title || ""
        }
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onClose={() => setRejectModalItemId(null)}
        onConfirm={confirmReject}
      />
    </div>
  )
}
