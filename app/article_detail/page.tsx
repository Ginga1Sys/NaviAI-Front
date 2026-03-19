import ArticleDetailPage from '../pages/dashboard/article_detail';
import CommonHeader from '../pages/dashboard/CommonHeader';
import { getArticle } from '../lib/articlesApi';
import { generateSummary } from '../lib/aiSummary';
import { cookies } from 'next/headers';

export const metadata = {
  title: '記事詳細',
};

type Props = {
  /** URL: /article_detail?id={知識ID} */
  searchParams: { id?: string };
};

export default async function Page({ searchParams }: Props) {
  const id = searchParams.id
  // Cookie に保存されたトークンを取得（Server Component は localStorage にアクセス不可）
  const token = cookies().get('token')?.value

  // サーバーで記事取得 + AI要約を事前生成（APIキーをクライアントに渡さない）
  let initialAiSummary: string | null = null
  if (id) {
    try {
      const article = await getArticle(id, token)
      if (article) {
        // updated_at をキャッシュキーに含めることで、記事更新後に古い要約がヒットしないようにする
        const cacheKey = `${id}:${article.meta.updated_at}`
        const result = await generateSummary(cacheKey, article.title, article.body)
        initialAiSummary = result.ok ? result.summary : null
      }
    } catch (err) {
      // バックエンド未起動・ネットワークエラー時はページ表示を継続（AI要約なしで描画）
      console.error('[article_detail] 記事取得に失敗しました:', err)
    }
  }

  return (
    <>
      <CommonHeader />
      <main>
        <ArticleDetailPage articleId={id} initialAiSummary={initialAiSummary} />
      </main>
    </>
  );
}
