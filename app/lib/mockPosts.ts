export type Post = {
  id: string
  title: string
  excerpt?: string
  date: string
  status: '公開' | '下書き' | 'レビュー中' | '差し戻し'
  thumbnail?: string
}

export async function getMockPosts(): Promise<Post[]> {
  // 模擬的な遅延
  await new Promise((r) => setTimeout(r, 200))

  return [
    {
      id: '1',
      title: '社内データ連携メモ',
      excerpt: '投稿の概要が入ります。',
      date: '2024-11-02',
      status: '下書き',
      thumbnail: '',
    },
    {
      id: '2',
      title: '機械学習基礎まとめ',
      excerpt: '進捗に関する説明。',
      date: '2024-12-18',
      status: 'レビュー中',
      thumbnail: '',
    },
    {
      id: '3',
      title: 'NLP ハンズオン資料',
      excerpt: '投稿の概要が入ります。',
      date: '2024-10-05',
      status: '公開',
      thumbnail: '',
    },
    {
      id: '4',
      title: 'データ公開の注意点（草案）',
      excerpt: '投稿の概要が入ります。',
      date: '2024-09-28',
      status: '差し戻し',
      thumbnail: '',
    },
  ]
}
