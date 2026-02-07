export type ReviewStatus = 'pending' | 'published' | 'declined'

export type ReviewItem = {
  id: string
  title: string
  summary: string
  author: string
  submittedAt: string
  status: ReviewStatus
  category: string
  markdownPreview: string
}

export type AuditEntry = {
  id: string
  action: string
  actor: string
  timestamp: string
}

export type QuickStats = {
  pending: number
  published: number
  declined: number
}

export const reviewQueue: ReviewItem[] = [
  {
    id: 'scr10-001',
    title: '社内AI活用ガイド',
    summary: '概要と手順のドラフト',
    author: '山本 太郎',
    submittedAt: '2026-02-02T09:42:00+09:00',
    status: 'pending',
    category: 'ナレッジ共有',
    markdownPreview:
      '## イントロダクション\n- 目的: AI活用の社内標準化\n- 適用範囲: 企画/開発/サポート\n\n### 手順サマリ\n1. 課題整理\n2. データ基盤準備\n3. ガバナンス整備',
  },
  {
    id: 'scr10-002',
    title: '機械学習導入事例',
    summary: 'データ準備の注意点',
    author: '佐藤 花子',
    submittedAt: '2026-02-01T14:10:00+09:00',
    status: 'pending',
    category: '導入事例',
    markdownPreview:
      '### プロジェクト概要\n- フェーズ: PoC\n- 工数: 6名月\n\n### 主な課題\n- データクレンジングの手間\n- モデルのドリフト監視',
  },
  {
    id: 'scr10-003',
    title: '不適切投稿対応マニュアル',
    summary: '通報～凍結までのプロセス',
    author: '阿部 孝司',
    submittedAt: '2026-01-30T11:25:00+09:00',
    status: 'pending',
    category: 'モデレーション',
    markdownPreview:
      '### アラート確認\n- 24h以内に一次確認\n- エビデンス保持\n\n### 凍結判断\n- エスカレーション基準\n- ログ出力と監査保管',
  },
]

export const auditLogs: AuditEntry[] = [
  {
    id: 'audit-101',
    action: '承認: 「RAGテンプレート共有」',
    actor: 'admin_ogawa',
    timestamp: '2026-02-06 18:42',
  },
  {
    id: 'audit-102',
    action: '差し戻し: 「GenAI導入手順」',
    actor: 'admin_sato',
    timestamp: '2026-02-06 17:05',
  },
  {
    id: 'audit-103',
    action: '権限変更: user_kubo → Moderator',
    actor: 'admin_mori',
    timestamp: '2026-02-05 10:22',
  },
]

export const quickStats: QuickStats = {
  pending: 8,
  published: 124,
  declined: 12,
}
