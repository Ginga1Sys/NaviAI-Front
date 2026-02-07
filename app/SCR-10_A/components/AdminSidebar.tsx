"use client"

import { AuditEntry, QuickStats } from "../mockData"
import styles from "../styles.module.css"

export type AdminSidebarProps = {
  stats: QuickStats
  auditLogs: AuditEntry[]
}

export function AdminSidebar({ stats, auditLogs }: AdminSidebarProps) {
  return (
    <aside
      aria-label="管理者ウィジェット"
      className={styles.widgetList}
    >
      <section className={styles.widgetCard}>
        <h2 style={{ marginBottom: 8 }}>ユーザー管理</h2>
        <p style={{ color: "#6b7280", marginBottom: 12 }}>
          権限変更・ロック・検索
        </p>
        <button
          type="button"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "999px",
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          管理者センターを開く
        </button>
      </section>

      <section className={styles.widgetCard}>
        <h2>監査ログ（最近）</h2>
        <div className={styles.auditList}>
          {auditLogs.map((log) => (
            <div key={log.id} className={styles.auditItem}>
              <p style={{ margin: 0, fontWeight: 600 }}>{log.action}</p>
              <p style={{ margin: "4px 0", fontSize: "0.9rem", color: "#6b7280" }}>
                {log.actor} — {log.timestamp}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.widgetCard}>
        <h2>ステータス概要</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statBadge}>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>Pending</p>
            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>{stats.pending}</p>
          </div>
          <div className={styles.statBadge}>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>Published</p>
            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>{stats.published}</p>
          </div>
          <div className={styles.statBadge}>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>Declined</p>
            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>{stats.declined}</p>
          </div>
        </div>
      </section>
    </aside>
  )
}
