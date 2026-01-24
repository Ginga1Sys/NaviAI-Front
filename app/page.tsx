import { redirect } from 'next/navigation'

export default function Home() {
  // ルートにアクセスしたらログイン画面へリダイレクト
  redirect('/login')
}
