"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './article_detail.module.css'
import { getMockArticle, ArticleDetail, Comment } from '../../../lib/mockArticles'
// import { getArticle } from '../../../lib/articlesApi' // 実APIを呼び出す場合はこちらを有効化

// ----- ユーティリティ -----
/** ステータス（英語）に対応するバッジCSSクラスを返す */
function getStatusBadgeClass(status: ArticleDetail['status'], s: typeof styles) {
  switch (status) {
    case 'published': return s.badgePublished
    case 'draft':     return s.badgeDraft
    case 'pending':   return s.badgeReview
    case 'declined':  return s.badgeDeclined
    case 'archived':  return s.badgeDraft
    default:          return s.badgeDraft
  }
}

/** ステータスを日本語ラベルへ変換 */
function getStatusLabel(status: ArticleDetail['status']): string {
  const map: Record<ArticleDetail['status'], string> = {
    published: '公開',
    draft:     '下書き',
    pending:   'レビュー中',
    declined:  '差し戻し',
    archived:  'アーカイブ',
  }
  return map[status] ?? status
}

// ----- Props -----
type Props = {
  /** 表示する記事ID。省略時は '1' を使用（ルーティング統合前の開発用フォールバック） */
  articleId?: string
  /** サーバーで事前生成した AI 要約。渡された場合はクライアント側の自動取得をスキップする */
  initialAiSummary?: string | null
}

// =================================================================================
// SCR-06 記事詳細画面
// レイアウト: 左ナビ(240px) | メインコンテンツ | 右サイドバー(320px)
// 参照: docs/nagumo/article_details/基本設計_API.md
//       GET /api/v1/knowledge/{id}
//       GET /api/v1/knowledge/{id}/comments
//       POST /api/v1/knowledge/{id}/like
//       POST /api/v1/knowledge/{id}/comments
// =================================================================================
export default function ArticleDetailPage({ articleId, initialAiSummary }: Props) {
  // クエリに id がなければ初期はロードしない（すぐに「記事が見つかりませんでした。」を表示）
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(!!articleId)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentInput, setCommentInput] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [submitting, setSubmitting] = useState(false)
  // initialAiSummary が渡された場合は initial 値として使用（クライアント自動取得をスキップ）
  const [aiSummary, setAiSummary] = useState<string | null>(initialAiSummary ?? null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // 記事データ取得
  useEffect(() => {
    let mounted = true
    // id がない場合は取得処理をスキップ
    if (!articleId) {
      setArticle(null)
      setLoading(false)
      return () => { mounted = false }
    }
    setLoading(true)
    getMockArticle(articleId).then((data) => {
      if (!mounted) return
      setArticle(data)
      setLiked(data?.liked_by_current_user ?? false)
      setLikeCount(data?.likes_count ?? 0)
      setComments(data?.comments ?? [])
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [articleId])

  // ---------- AI要約取得 ----------
  // fetchSummary を関数化することで「再試行」ボタンからも呼び出せる
  const fetchSummary = React.useCallback(async (targetArticle: ArticleDetail) => {
    // localStorage からトークンを取得（ログインページで token キーに保存済み）
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setAiError('AI要約を取得するにはログインが必要です。')
      return
    }

    setAiLoading(true)
    setAiSummary(null)
    setAiError(null)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: targetArticle.title, body: targetArticle.body, articleId: articleId ?? undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        // 429: クォータ超過、401/403: セッション切れ・認証エラー などを判別して日本語メッセージを出す
        if (res.status === 429) {
          setAiError('APIの利用上限に達しました。しばらく待ってから再試行してください。')
        } else if (res.status === 401 || res.status === 403) {
          setAiError('セッションが切れました。再ログインしてください。')
        } else {
          setAiError(data?.error ?? 'AI要約の生成に失敗しました。')
        }
        return
      }
      setAiSummary(data.summary ?? null)
    } catch {
      setAiError('通信エラーが発生しました。ネットワークを確認してください。')
    } finally {
      setAiLoading(false)
    }
  }, [articleId])

  // 記事ロード完了後に要約を自動取得
  // - initialAiSummary が文字列（サーバーで生成成功）→ クライアントフェッチ不要
  // - initialAiSummary が null（サーバー生成失敗）→ クライアントでフォールバックフェッチ
  // - initialAiSummary が undefined（Server Component を通さない直接利用）→ クライアントでフェッチ
  useEffect(() => {
    if (!article) return
    // サーバーが正常に要約を返した場合のみスキップ（null はサーバー失敗なのでフォールバックとしてフェッチ）
    if (typeof initialAiSummary === 'string') return
    fetchSummary(article)
  }, [article, fetchSummary, initialAiSummary])

  /*
  // 実APIを呼び出す場合のuseEffectのコード例
  useEffect(() => {
    let mounted = true
    setLoading(true)
    getArticle(articleId).then((data) => {
      if (!mounted) return
      setArticle(data)
      setLiked(data?.likedByMe ?? false)
      setLikeCount(data?.likes ?? 0)
      setComments(data?.comments ?? [])
      setLoading(false)
    })
    return () => { mounted = false }
  }, [articleId])
  */

  // ---------- いいねトグル ----------
  const handleLike = () => {
    // API作成時に差し替え: POST /api/v1/knowledge/{id}/like または DELETE /api/v1/knowledge/{id}/like
    setLiked((prevLiked) => {
      setLikeCount((c) => (prevLiked ? c - 1 : c + 1))
      return !prevLiked
    })
  }

  // ---------- コメント送信 ----------
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim() || submitting) return
    setSubmitting(true)

    // API作成時に差し替え: POST /api/v1/knowledge/{id}/comments
    // 以下はモック追加処理
    await new Promise((r) => setTimeout(r, 300))
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      knowledge_id: articleId ?? '1',
      author: { id: 'current-user', name: 'あなた', role: 'user', is_active: true },
      body: commentInput.trim(),
      parent_comment_id: null,
      is_deleted: false,
      created_at: new Date().toISOString().slice(0, 10),
      likes: 0,
      replies: [],
    }
    setComments((prev) => [...prev, newComment])
    setCommentInput('')
    setSubmitting(false)
  }

  // ---------- ローディング ----------
  if (loading) {
    return <div className={styles.loading}>読み込み中…</div>
  }

  // ---------- 記事が存在しない場合 ----------
  if (!article) {
    return <div className={styles.notFound}>記事が見つかりませんでした。</div>
  }

  const badgeClass = getStatusBadgeClass(article.status, styles)
  /** AI要約（リアルタイム生成）を改行で分割して箇条書き表示
   *  CSS の ::before が「•」を付与するため、AIレスポンスの行頭「・」は除去する */
  const aiPoints = aiSummary
    ? aiSummary.split('\n').filter(Boolean).map((p) => p.replace(/^[・•]\s*/, ''))
    : []
  /** パンくず: ['ナレッジ', ...タグ名] */
  const breadcrumb = ['ナレッジ', ...article.tags.map((t) => t.name)]
  /** 削除済みを除いたコメント一覧 */
  const activeComments = comments.filter((c) => !c.is_deleted)

  return (
    <div className={styles.container}>
      {/* ========== 左ナビゲーション ========== */}
      <nav className={styles.leftNav} aria-label="サイドナビ">
        {/* 🟡 [コード品質] href="#" のままではルーティングが未実装。
             実際のパスへの差し替え、または API作成時に差し替え コメントの追記を推奨。 */}
        <Link href="#" className={styles.navItem}>ダッシュボード</Link>
        <Link href="#" className={`${styles.navItem} ${styles.navItemActive}`}>ナレッジ</Link>
        <Link href="#" className={styles.navItem}>承認</Link>
        <Link href="#" className={styles.navItem}>投稿一覧</Link>
      </nav>

      {/* ========== メインコンテンツ ========== */}
      <main className={styles.main} aria-label="記事詳細">

        {/* パンくずリスト */}
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={`${crumb}:${i}`}>
              {i > 0 && <span className={styles.breadcrumbSep}>/</span>}
              <span>{crumb}</span>
            </React.Fragment>
          ))}
        </nav>

        {/* 記事ヘッダー */}
        <div className={styles.articleHeader}>
          <h1 className={styles.articleTitle}>{article.title}</h1>
          <div className={styles.articleMeta}>
            <span>著者: {article.author.name}</span>
            <span>公開: {article.published_at}</span>
            <span className={`${styles.badge} ${badgeClass}`}>{getStatusLabel(article.status)}</span>
            <div className={styles.headerActions}>
              {article.meta.is_editable_by_current_user && (
                // 画面作成時に差し替え: 編集画面への遷移
                <button type="button" className={styles.btnOutline} aria-label="記事を編集">
                  編集
                </button>
              )}
              <button
                className={`${styles.btnOutline} ${liked ? styles.btnLiked : ''}`}
                onClick={handleLike}
                aria-label={liked ? 'いいねを取り消す' : 'いいねする'}
              >
                ❤️ いいね {likeCount > 0 && `(${likeCount})`}
              </button>
            </div>
          </div>
        </div>

        {/* 記事本文カード */}
        <section className={styles.articleCard} aria-label="記事本文">
          <p className={styles.articleBody}>{article.body}</p>

          {/* 添付ファイル */}
          {article.attachments.length > 0 && (
            <div className={styles.attachments}>
              <p className={styles.attachmentsLabel}>添付ファイル</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {article.attachments.map((att) => (
                  <a
                    key={att.id}
                    href="#"
                    className={styles.attachmentChip}
                    aria-label={`${att.filename} をダウンロード`}
                  >
                    📎 {att.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* AI要約カード */}
        <section className={styles.aiCard} aria-label="AI要約">
          <h2 className={styles.aiCardTitle}>AI要約</h2>
          {aiLoading ? (
            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>AI要約を生成中…</p>
          ) : aiError ? (
            <div>
              <p style={{ fontSize: '0.875rem', color: '#DC2626', marginBottom: '8px' }}>
                ⚠️ {aiError}
              </p>
              {/* フォールバック: モックデータの ai_summary があれば表示 */}
              {article.ai_summary && (
                <ul className={styles.aiSummaryList} style={{ opacity: 0.6 }}>
                  {article.ai_summary.split('\n').filter(Boolean).map((point, i) => (
                    <li key={i} className={styles.aiSummaryItem}>{point.replace(/^[・•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => fetchSummary(article)}
                className={styles.btnOutline}
                style={{ marginTop: '8px', fontSize: '0.8rem' }}
              >
                再試行
              </button>
            </div>
          ) : aiPoints.length > 0 ? (
            <ul className={styles.aiSummaryList}>
              {/* XSS 安全: {point} は React の JSX テキスト補間により自動エスケープされる。
                  dangerouslySetInnerHTML は使用していないため生 HTML 注入の危険はない。 */}
              {aiPoints.map((point, i) => (
                <li key={i} className={styles.aiSummaryItem}>{point}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>要約がありません。</p>
          )}
        </section>

        {/* コメントスレッド */}
        <section className={styles.commentCard} aria-label="コメント">
          <h2 className={styles.commentCardTitle}>コメント</h2>

          {/* コメント一覧 */}
          {activeComments.length > 0 ? (
            <ul className={styles.commentList}>
              {activeComments.map((comment) => (
                  <li key={comment.id} className={styles.commentItem}>
                    <span className={styles.commentAuthor}>{comment.author.name}</span>
                    <p className={styles.commentBody}>{comment.body}</p>
                    <div className={styles.commentFooter}>
                      <span>{comment.created_at}</span>
                      {/* API作成時に差し替え: POST /api/v1/knowledge/{id}/comment-likes */}
                      <button type="button" className={styles.commentLikeBtn} aria-label="いいね">
                        ❤️ {comment.likes}
                      </button>
                      {/* API作成時に差し替え: コメント返信フォームを表示する処理 */}
                      <button type="button" className={styles.commentLikeBtn} aria-label="返信">
                        返信
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>まだコメントはありません。</p>
          )}

          {/* コメント入力フォーム */}
          <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
            <textarea
              className={styles.commentInput}
              placeholder="コメントを追加…"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              aria-label="コメント入力"
              rows={2}
            />
            <button
              type="submit"
              className={styles.commentSubmitBtn}
              disabled={!commentInput.trim() || submitting}
              aria-label="コメントを送信"
            >
              {submitting ? '送信中…' : '送信'}
            </button>
          </form>
        </section>
      </main>

      {/* ========== 右サイドバー ========== */}
      <aside className={styles.right} aria-label="ウィジェット">
        {/* 著者情報 */}
        <div className={styles.sidebarCard}>
          <h2 className={styles.sidebarTitle}>著者</h2>
          <p className={styles.authorName}>{article.author.name}</p>
          {article.author.department && (
            <p className={styles.authorMeta}>部署: {article.author.department}</p>
          )}
        </div>

        {/* 関連記事 */}
        {article.related_articles.length > 0 && (
          <div className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>関連記事</h2>
            <ul className={styles.relatedList}>
              {article.related_articles.map((rel) => (
                <li key={rel.id} className={styles.relatedItem}>
                  <a href={`/article_detail?id=${rel.id}`}>{rel.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 管理操作 */}
        <div className={styles.sidebarCard}>
          <h2 className={styles.sidebarTitle}>管理操作</h2>
          <p className={styles.adminLabel}>承認 / 差し戻し / 監査ログ</p>
          <div className={styles.adminActions}>
            {/* API作成時に差し替え: POST /api/v1/admin/knowledge/{id}/approve */}
            <button type="button" className={styles.btnAdmin}>承認する</button>
            {/* API作成時に差し替え: POST /api/v1/admin/knowledge/{id}/reject */}
            <button type="button" className={`${styles.btnAdmin} ${styles.btnAdminDanger}`}>
              差し戻す
            </button>
            {/* API作成時に差し替え: 編集履歴取得API */}
            <button type="button" className={styles.btnAdmin}>編集履歴を見る</button>
          </div>
        </div>
      </aside>
    </div>
  )
}
