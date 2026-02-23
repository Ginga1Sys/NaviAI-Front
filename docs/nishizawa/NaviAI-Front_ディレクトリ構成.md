# NaviAI-Front/app ディレクトリ構成

以下は `NaviAI-Front/app` 配下の主要ファイルとディレクトリ、およびそれぞれの役割の簡単な説明です。

- app/
  - layout.tsx: アプリ共通レイアウト（ページ共通のヘッダー/フッター、メタ情報の設定）。
  - page.tsx: ルート（アプリトップ）用のページエントリポイント。
  - components/
    - LoginForm.tsx: ログインフォームコンポーネント（入力バリデーション、送信ハンドリング）。
    - MyPostItem.tsx: 投稿一覧内の1件表示コンポーネント（カード表示、メタ情報、操作ボタン）。
    - MyPostList.tsx: マイ投稿一覧をレンダリングするリストコンポーネント（ページネーション/取得ロジックを持つ）。
    - Dashboard.tsx: ダッシュボード画面のメインコンポーネント（サイドバーナビ・記事カード・統計ウィジェットのレイアウト統合）。
    - Dashboard.tsx: ダッシュボード画面のメインコンポーネント（サイドバーナビ・記事カード・統計ウィジェットのレイアウト統合）。
      - 変更点（feature/dashboard_searchlist ブランチ）: 左サイドバーにブランド `Ginga` を追加し、サイドバー開閉トグル（localStorage に状態保存）を実装。ナビ順序を入れ替え、`管理者パネル` と `＋ 新規投稿`（暫定ルート `/admin`, `/posts/new`）をサイドバーに追加しています。
    - QuickSearch.tsx: クイック検索コンポーネント（`GET /api/v1/knowledge` を呼び出し、デバウンス付きサジェスト表示・検索結果ページへの遷移）。
    - QuickSearch.module.css: `QuickSearch` 専用のモジュール CSS。
    - QuickTags.tsx: タグ一覧コンポーネント（`GET /api/v1/tags` を呼び出してタグチップを表示、クリックでタグ検索ページへ遷移）。
    - QuickTags.module.css: `QuickTags` 専用のモジュール CSS。
  - lib/
    - auth.ts: フロントエンドの認証ユーティリティ（トークン保存/取得、ログインAPI呼び出しのラッパー）。
    - fetcher.ts: 汎用 fetch ユーティリティ（Authorization ヘッダー自動付与、非 OK レスポンス例外化）。
    - mockPosts.ts: 開発/テスト用のモック投稿データ。
  - dashboard/
    - page.tsx: `/dashboard` 用のページ。`CommonHeader` と `Dashboard` コンポーネントをレンダリング。
    - CommonHeader.tsx: ダッシュボード共通ヘッダーのクライアントコンポーネント（検索入力を左寄せに移動、ヘッダ内のブランド/ページリンクとヘッダ内の `＋ 新規投稿` を削除し、通知/アバターは維持）。
  - login/
    - page.tsx: `/login` 用のページ。`LoginForm` を組み合わせてログイン画面を構築。
  - my_post_list/
    - page.tsx: マイ投稿一覧ページのエントリ。`MyPostList` を使用してユーザー投稿を表示。
  - pages/
    - dashboard/
      - common_header.html: ダッシュボード共通の静的ヘッダー（HTMLスニペット）。
      - CommonHeader.tsx: `common_header.html` を React コンポーネントとして再実装したクライアントコンポーネント。ヘッダーはクイック検索を左寄せに移し、ブランドや一部ナビをサイドバーへ移動しています。
      - common_module.css: ダッシュボード領域のレイアウト/ユーティリティスタイル。
      - my_post_list/
        - index.tsx: マイ投稿一覧ページ（Pages ルーターのエントリ、`MyPostList` を使用）。
        - my_post_list.module.css: マイ投稿ページ固有のモジュール CSS。
    - login/
      - index.tsx: Pages ルーターのログインページ（`LoginForm` を組み合わせて使用）。
      - login.module.css: ログインページのスタイル。
    - public-home/
      - index.tsx: 非ログイン向けの公開トップページ（紹介・CTA・サンプル記事表示）。
      - common_module.css: 公開トップ専用のスタイルシート（SCR-12）。

注記:
- `app/` 配下は Next.js の App Router を採用している部分で、`pages/` 配下は Pages ルーターや既存のページ/アセット互換のために残された構成です。新規実装は `app/` 側にあるコンポーネントやルートを優先して使用してください。
  - styles/
    - global.css: アプリ共通のグローバルスタイル。
    - tokens.css: デザイントークン（色、スペーシング、フォントサイズ等）。
    - dashboard.module.css: ダッシュボード画面のレイアウト・統計ウィジェット・記事カード等のモジュール CSS。
      - 追加/更新されたクラス: `.leftBrand`（サイドバー上部ブランド）、`.sidebarToggleButton`（トグル）、`.leftNavCollapsed`（折りたたみ状態）、`.newPostButton`（サイドバー内の新規投稿ボタン）。
    - components/: コンポーネント単位の CSS モジュールや共通スタイルを格納。
      - card.module.css: カードUI用のモジュールCSS。
      - header.module.css: ヘッダー用のモジュールCSS。

補足:
- コンポーネント実装は `app/components` 配下で再利用可能な UI とロジックを分離しており、ページは `app/*/page.tsx` でルーティングに対応しています。
- `lib` は API 呼び出しや認証などのユーティリティ集で、テストや Storybook 的な用途で `mockPosts.ts` などのモックが用意されています。

生成日時: 2026-02-23（ダッシュボード画面実装およびヘッダー/サイドバー修正に伴い更新）
