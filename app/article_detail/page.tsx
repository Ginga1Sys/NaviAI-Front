import ArticleDetailPage from '../pages/dashboard/article_detail';
import CommonHeader from '../pages/dashboard/CommonHeader';
import { getMockArticle } from '../lib/mockArticles';
import { generateSummary } from '../lib/aiSummary';

export const metadata = {
  title: '記事詳細',
};

// 🟡 [コード品質] Next.js 15 以降、searchParams は Promise<{ id?: string }> 型に変更された。
// async/await または use() でアンラップする対応の暑要あり。
// 参考: https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
type Props = {
  /** URL: /article_detail?id={知識ID} */
  searchParams: { id?: string };
};

export default async function Page({ searchParams }: Props) {
  const id = searchParams.id

  // サーバーで記事取得 + AI要約を事前生成（APIキーをクライアントに渡さない）
  let initialAiSummary: string | null = null
  if (id) {
    const article = await getMockArticle(id)
    if (article) {
      // updated_at をキャッシュキーに含めることで、記事更新後に古い要約がヒットしないようにする
      const cacheKey = `${id}:${article.meta.updated_at}`
      const result = await generateSummary(cacheKey, article.title, article.body)
      initialAiSummary = result.ok ? result.summary : null
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
