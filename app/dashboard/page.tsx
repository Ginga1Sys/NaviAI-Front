import type { Metadata } from "next"
import CommonHeader from "../pages/dashboard/CommonHeader"
import Dashboard from "../components/Dashboard"

export const metadata: Metadata = {
  title: "ダッシュボード | NaviAI",
  description: "AIナレッジ共有プラットフォームのダッシュボード",
}

export default function DashboardPage() {
  return (
    <>
      <CommonHeader />
      <Dashboard />
    </>
  )
}
