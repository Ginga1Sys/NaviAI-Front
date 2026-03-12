import type { Metadata } from "next"
import { Suspense } from "react"
import CommonHeader from "../pages/dashboard/CommonHeader"
import SearchResultView from "../components/SearchResultView"

export const metadata: Metadata = {
  title: "検索結果 | NaviAI",
  description: "AIナレッジ共有プラットフォームの検索結果一覧",
}

/**
 * 検索結果一覧ページ (SCR-04)
 *
 * URL 例: /search_list?q=keyword&tags=ai,ml&page=1
 *
 * SearchResultView は useSearchParams を使用するためクライアントコンポーネント。
 * Next.js App Router の要件に従い <Suspense> でラップする。
 */
export default function SearchListPage() {
  return (
    <>
      <CommonHeader />
      <Suspense fallback={<div style={{ padding: "24px", color: "#6B7280" }}>読み込み中...</div>}>
        <SearchResultView />
      </Suspense>
    </>
  )
}
