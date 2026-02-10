# SCR-05: 投稿一覧（マイ投稿） — 作成ファイル一覧

以下は SCR-05（投稿一覧：マイ投稿）画面を作成するために必要なファイル、作成理由、想定パスです。モックAPIを使用し、画面イメージは指定のSVGを参照します。

## 作成する必要のあるファイル（必須）
- ファイル: app/my_post_list/page.tsx  
  理由  : App Router のページ本体（レイアウト適用、SSR/SSG やメタ情報）。  
  パス  : app/my_post_list/page.tsx

- ファイル: app/my_post_list/index.tsx  
  理由  : クライアント側 UI コンポーネント（フィルタ、ページネーション、操作ボタン等）。  
  パス  : app/my_post_list/index.tsx

- ファイル: app/my_post_list/my_post_list.module.css  
  理由  : ページ固有スタイル（カード、リスト、空状態、レスポンシブ等）。  
  パス  : app/my_post_list/my_post_list.module.css

- ファイル: app/components/MyPostList.tsx  
  理由  : 投稿一覧の再利用コンポーネント（一覧レンダリング）。  
  パス  : app/components/MyPostList.tsx

- ファイル: app/components/MyPostItem.tsx  
  理由  : 各投稿アイテムの小コンポーネント（サムネ、タイトル、メタ情報、操作）。  
  パス  : app/components/MyPostItem.tsx

- ファイル: app/lib/mockPosts.ts  
  理由  : モックデータ提供（画面はこのモックを使用してAPI呼び出しを模擬）。  
  パス  : app/lib/mockPosts.ts

## 作成を検討するファイル（任意だが推奨）
- ファイル: app/pages/api/mock/my-posts.ts  
  理由  : HTTP エンドポイントとしてモックを提供する場合に使用。fetch で叩ける。  
  パス  : pages/api/mock/my-posts.ts

- ファイル: app/components/Pagination.tsx  
  理由  : 共通のページネーションコンポーネント。  
  パス  : app/components/Pagination.tsx

- ファイル: app/components/EmptyState.tsx  
  理由  : 投稿が無い場合の共通表示コンポーネント。  
  パス  : app/components/EmptyState.tsx

- ファイル: app/hooks/usePosts.ts  
  理由  : データ取得・ローディング・エラー・フィルタ管理用のカスタムフック。  
  パス  : app/hooks/usePosts.ts

- ファイル: __tests__/MyPostList.test.tsx  
  理由  : ユニットテスト（レンダリング・フィルタ・空状態・エラー等）。  
  パス  : __tests__/MyPostList.test.tsx

## ドキュメント・設計関連
- ファイル: docs/design/SCR-05_投稿一覧_アクセシビリティ.md  
  理由  : キーボード操作、ARIA、フォーカスルール等の定義。  
  パス  : docs/design/SCR-05_投稿一覧_アクセシビリティ.md

## 参照・必須準備項目（必要項目）
- モック仕様（mockPosts のレスポンススキーマ、ページング/フィルタ仕様）。
- 画面イメージ（参照）: ..\..\web_20251120\proj-1sys-ax-2025\docs\00_personal\nishizawa\基本設計書\画面イメージ図\SCR-05_投稿一覧（マイ投稿）_イメージ図.svg
- ルーティング／遷移仕様（投稿編集・詳細・作成へのパス）。
- アクセシビリティ要件（ARIA、キーボード操作、aria-live など）。
- スタイル設計（トークンやカラーパレットの準拠）。
- テストケース一覧（ユニット／E2E）。

## 参考（ログイン画面を参照）
- 参考ファイル構成: index.tsx / login.module.css / page.tsx / auth.ts を参考に実装。
