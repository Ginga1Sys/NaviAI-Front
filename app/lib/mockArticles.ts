// 記事詳細画面 (SCR-06) 用モックデータ
// 実APIに差し替える際は GET /api/v1/knowledge/{id} 等に置き換えてください
// APIレスポンス仕様は docs/nagumo/article_details/基本設計_API.md を参照

// ----- 著者 -----
export type Author = {
  id: string
  name: string
  role: string
  is_active: boolean
}

// ----- コメント -----
export type Comment = {
  id: string
  knowledge_id: string
  author: Author
  body: string
  parent_comment_id: string | null
  is_deleted: boolean
  created_at: string
}

// ----- 添付ファイル -----
export type Attachment = {
  id: string
  filename: string
  content_type: string
  size_bytes: number
  storage_path: string
  uploaded_at: string
}

// ----- タグ -----
export type Tag = {
  id: string
  name: string
}

// ----- 編集履歴 -----
export type Revision = {
  id: string
  knowledge_id: string
  editor: Author
  title: string
  body: string
  diff_summary: string
  created_at: string
}

// ----- 記事詳細（GET /api/v1/knowledge/{id} レスポンス） -----
export type ArticleDetail = {
  id: string
  title: string
  body: string
  /** draft / pending / published / declined / archived */
  status: 'published' | 'draft' | 'pending' | 'declined' | 'archived'
  is_deleted: boolean
  published_at: string
  author: Author
  attachments: Attachment[]
  tags: Tag[]
  likes_count: number
  liked_by_current_user: boolean
  comments: Comment[]
  revisions: Revision[]
  meta: {
    created_at: string
    updated_at: string
  }
}

export async function getMockArticle(id: string): Promise<ArticleDetail | null> {
  // 模擬的な遅延
  await new Promise((r) => setTimeout(r, 200))

  const articles: ArticleDetail[] = [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      title: '社内データ連携メモ',
      body: '## 概要\n\n社内システム間でデータを安全に連携するための手順と注意点をまとめます。\n\n## 手順\n\n1. データ定義の確認\n2. 転送方法（API / SFTP）選定\n3. ロギングと監査の実装',
      status: 'published',
      is_deleted: false,
      published_at: '2024-11-02',
      author: {
        id: 'a1b2c3d4-1111-2222-3333-444455556666',
        name: '西沢 太郎',
        role: 'admin',
        is_active: true,
      },
      attachments: [
        {
          id: 'b7e23f8d-9c2e-4f2e-8a1b-1234567890ab',
          filename: '連携設計_v1.pdf',
          content_type: 'application/pdf',
          size_bytes: 234567,
          storage_path: 's3://ginga-bucket/attachments/連携設計_v1.pdf',
          uploaded_at: '2024-11-01T09:00:00Z',
        },
      ],
      tags: [
        { id: '2d3e4f50-0000-1111-2222-333344445555', name: 'AI' },
        { id: '3a4b5c60-6666-7777-8888-9999aaaabbbb', name: '社内データ連携' },
      ],
      likes_count: 4,
      liked_by_current_user: false,
      comments: [
        {
          id: 'c1111111-2222-3333-4444-555566667777',
          knowledge_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          author: {
            id: 'd2222222-3333-4444-5555-666677778888',
            name: '佐藤 花子',
            role: 'user',
            is_active: true,
          },
          body: 'とても参考になりました。API認証はOAuth2で良いでしょうか？',
          parent_comment_id: null,
          is_deleted: false,
          created_at: '2024-11-03',
        },
        {
          id: 'c9999999-aaaa-bbbb-cccc-ddddeeeeffff',
          knowledge_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          author: {
            id: 'e3333333-4444-5555-6666-777788889999',
            name: '管理者',
            role: 'admin',
            is_active: true,
          },
          body: '下書きのログ取得要件を追加してください。',
          parent_comment_id: null,
          is_deleted: false,
          created_at: '2024-11-04',
        },
      ],
      revisions: [
        {
          id: 'r1111111-2222-3333-4444-555566667777',
          knowledge_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          editor: {
            id: 'a1b2c3d4-1111-2222-3333-444455556666',
            name: '西沢 太郎',
            role: 'admin',
            is_active: true,
          },
          title: '社内データ連携メモ（初版）',
          body: '初期版本文（Markdown）',
          diff_summary: '初版作成',
          created_at: '2024-11-01T08:45:00Z',
        },
      ],
      meta: {
        created_at: '2024-11-01T08:40:00Z',
        updated_at: '2024-11-03T11:50:00Z',
      },
    },
    {
      id: 'z1111111-2222-3333-4444-555566667777',
      title: '機械学習基礎まとめ',
      body: '## 概要\n\n機械学習の基礎概念を整理したドキュメントです。\n\n## 内容\n\n- 教師あり学習\n- 教師なし学習\n- 強化学習',
      status: 'pending',
      is_deleted: false,
      published_at: '2024-09-10',
      author: {
        id: 'f4444444-5555-6666-7777-888899990000',
        name: '田中 一郎',
        role: 'user',
        is_active: true,
      },
      attachments: [],
      tags: [
        { id: '2d3e4f50-0000-1111-2222-333344445555', name: 'AI' },
        { id: '4b5c6d70-8888-9999-aaaa-bbbbccccdddd', name: '機械学習' },
      ],
      likes_count: 2,
      liked_by_current_user: false,
      comments: [],
      revisions: [],
      meta: {
        created_at: '2024-09-09T10:00:00Z',
        updated_at: '2024-09-09T10:00:00Z',
      },
    },
  ]

  // IDが完全一致、または短縮IDのプレフィックス一致でも検索
  return articles.find((a) => a.id === id || a.id.startsWith(id)) ?? null
}

/*
// 実APIを呼び出す場合のコード例

const API_BASE_URL = 'https://api.example.internal/api/v1'

export async function getArticle(id: string): Promise<ArticleDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/knowledge/${id}`, {
      headers: { Authorization: `Bearer ${YOUR_TOKEN}` },
    })
    if (!response.ok) throw new Error('記事の取得に失敗しました')
    const { data } = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return null
  }
}
*/
