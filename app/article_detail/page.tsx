// 🔴 [バグ・潜在問題] app ディレクトリから pages 配下のコンポーネントをインポートしている。
// app Router と Pages Router の混在は将来の移行時に問題となる可能性がある。
// コンポーネントを app/components 配下に移動することを推奨。
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
      initialAiSummary = await generateSummary(id, article.title, article.body)
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
