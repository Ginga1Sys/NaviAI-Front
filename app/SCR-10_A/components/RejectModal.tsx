"use client"

import { useEffect, useRef } from "react"
import styles from "../styles.module.css"

export type RejectModalProps = {
  isOpen: boolean
  title: string
  reason: string
  onReasonChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

export function RejectModal({
  isOpen,
  title,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
}: RejectModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="却下理由入力">
      <div className={styles.modalBody}>
        <h3 style={{ marginTop: 0 }}>「{title}」を却下</h3>
        <p style={{ color: "#6b7280" }}>差し戻しの理由を入力してください（必須）。</p>
        <textarea
          ref={textareaRef}
          value={reason}
          onChange={(evt) => onReasonChange(evt.target.value)}
          aria-label="却下理由"
        />
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} style={{ background: "#e5e7eb" }}>
            キャンセル
          </button>
          <button
            type="button"
            className={styles.btnReject}
            onClick={onConfirm}
            disabled={!reason.trim()}
            aria-disabled={!reason.trim()}
          >
            却下を確定
          </button>
        </div>
      </div>
    </div>
  )
}
