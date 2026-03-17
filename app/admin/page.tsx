"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AdminSidebar } from "./components/AdminSidebar"
import { PreviewPanel } from "./components/PreviewPanel"
import { RejectModal } from "./components/RejectModal"
import { ReviewList } from "./components/ReviewList"
import { auditLogs as mockAuditLogs, quickStats as mockQuickStats, reviewQueue as mockReviewQueue } from "./mockData"
import { createScr10AdminApiClient } from "./lib/scr10AdminApi"
import styles from "./styles.module.css"

export default function AdminPanelPage() {
  const [items, setItems] = useState(mockReviewQueue)
  const [activeId, setActiveId] = useState(mockReviewQueue[0]?.id)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rejectModalItemId, setRejectModalItemId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [stats, setStats] = useState(mockQuickStats)
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs)
  const [searchQuery, setSearchQuery] = useState("")

  const api = useMemo(
    () =>
      createScr10AdminApiClient({
        getAccessToken: () =>
          typeof window === "undefined" ? null : window.localStorage.getItem("scr10_admin_token"),
      }),
    [],
  )

  const itemsRef = useRef(items)
  itemsRef.current = items

  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [items, activeId])

  const pendingCount = selectedIds.size

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const [knowledgeRes, statsRes, auditRes] = await Promise.all([
          api.adminKnowledgeList({ status: "pending", per_page: 50, sort: "-submitted_at" }),
          api.adminKnowledgeStats(),
          api.adminAuditLogsList({ per_page: 5, sort: "-created_at" }),
        ])

        if (cancelled) return

        const nextItems = knowledgeRes.data.map((k) => ({
          id: k.id,
          title: k.title,
          summary: k.summary ?? "",
          author: k.author?.name ?? "",
          submittedAt: k.submitted_at ?? new Date().toISOString(),
          status: k.status === "pending" || k.status === "published" || k.status === "declined" ? k.status : "pending",
          category: k.category ?? "",
          markdownPreview: "",
        }))

        setItems(nextItems)
        setActiveId(nextItems[0]?.id)
        setStats(statsRes.data)
        setAuditLogs(
          auditRes.data.map((l) => ({
            id: l.id,
            action: l.action,
            actor: l.actor?.name ?? "",
            timestamp: new Date(l.created_at).toLocaleString("ja-JP"),
          })),
        )
      } catch (e) {
        // 認証未設定やCORSなどで失敗した場合は、現状のモック表示を維持する
        console.warn("SCR-10 API load failed; falling back to mock data", e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [api])

  useEffect(() => {
    let cancelled = false
    const targetId = activeId
    if (!targetId) return
    const current = itemsRef.current.find((it) => it.id === targetId)
    if (!current) return
    if (current.markdownPreview) return

    ;(async () => {
      try {
        const detail = await api.adminKnowledgeGetDetail(targetId)
        if (cancelled) return
        setItems((prev) =>
          prev.map((it) => (it.id === targetId ? { ...it, markdownPreview: detail.data.body } : it)),
        )
      } catch (e) {
        // プレビュー取得に失敗しても一覧は表示できるので握りつぶす
        console.warn("SCR-10 API detail load failed", e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [activeId, api])

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

  async function handleApprove(id: string) {
    try {
      await api.adminKnowledgeApprove(id)
      applyStatus(new Set([id]), "published")
    } catch (e) {
      console.error("approve failed", e)
    }
  }

  function handleReject(id: string) {
    setRejectModalItemId(id)
    setRejectReason("")
  }

  async function handleBulkApprove() {
    if (!selectedIds.size) return
    try {
      await api.adminKnowledgeBulkAction({ action: "approve", ids: Array.from(selectedIds) })
      applyStatus(selectedIds, "published")
    } catch (e) {
      console.error("bulk approve failed", e)
    }
  }

  function handleBulkReject() {
    if (!selectedIds.size) return
    setRejectModalItemId(Array.from(selectedIds)[0])
    setRejectReason("")
  }

  async function confirmReject() {
    if (!rejectModalItemId) return
    const reason = rejectReason.trim()
    if (!reason) return

    const targetIds = selectedIds.size ? selectedIds : new Set([rejectModalItemId])
    const ids = Array.from(targetIds)

    try {
      if (ids.length > 1) {
        await api.adminKnowledgeBulkAction({ action: "reject", ids, reason })
      } else {
        await api.adminKnowledgeReject(ids[0], { reason })
      }

      applyStatus(targetIds, "declined")
      setRejectModalItemId(null)
      setRejectReason("")
    } catch (e) {
      console.error("reject failed", e)
    }
  }

  return (
    <div className={styles.page}>
      <a href="#main" className={styles.a11ySkipLink}>メインへスキップ</a>
      <header className={styles.topBar}>
        <div className={styles.searchBox}>
          <span role="img" aria-label="検索">
            🔍
          </span>
          <input
            type="search"
            placeholder="投稿タイトル・タグを検索"
            aria-label="投稿検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            {/* TODO: 各ボタンにルーティング処理を実装予定 */}
            {[
              "ダッシュボード",
              "ナレッジ",
              "承認",
              "ユーザー",
              "監査ログ",
            ].map((label) => (
              <button key={label} type="button" className={styles.navButton} data-active={label === "承認"}>
                {label}
              </button>
            ))}
          </div>
          {/* TODO: 新規投稿画面への遷移を実装予定 */}
          <button type="button" className={styles.composeButton}>
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

        <AdminSidebar stats={stats} auditLogs={auditLogs} />
      </div>

      <RejectModal
        isOpen={Boolean(rejectModalItemId)}
        title={
          selectedIds.size > 1
            ? `${selectedIds.size}件の投稿`
            : items.find((item) => item.id === (rejectModalItemId || activeId))?.title || ""
        }
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onClose={() => setRejectModalItemId(null)}
        onConfirm={confirmReject}
      />
    </div>
  )
}