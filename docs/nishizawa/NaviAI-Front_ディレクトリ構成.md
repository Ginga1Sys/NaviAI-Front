# NaviAI-Front/app ディレクトリ構成

以下は `NaviAI-Front/app` 配下の主要ファイルとディレクトリ、およびそれぞれの役割の簡単な説明です。

- app/
  - layout.tsx: アプリ共通レイアウト（ページ共通のヘッダー/フッター、メタ情報の設定）。
  - page.tsx: ルート（アプリトップ）用のページエントリポイント。
  - components/
    - LoginForm.tsx: ログインフォームコンポーネント（メールアドレス入力・バリデーション・送信ハンドリング。メールアドレス専用化：「メールアドレス または ユーザー名」入力を「メールアドレス」のみに統一。型定義を `identifier` → `email` に変更。）
    - RegisterForm.tsx: 会員登録フォームコンポーネント（名前・メール・パスワード入力、クライアント側バリデーション、`POST /api/auth/register` 呼び出し、成功/失敗メッセージ表示）。
    - MyPostItem.tsx: 投稿一覧内の1件表示コンポーネント（カード表示、メタ情報、操作ボタン）。
    - MyPostList.tsx: マイ投稿一覧をレンダリングするリストコンポーネント（ページネーション/取得ロジックを持つ）。
    - Dashboard.tsx: ダッシュボード画面のメインコンポーネント（サイドバーナビ・記事カード・統計ウィジェットのレイアウト統合）。管理者判定: localStorage `currentUser` から `isAdmin`/`roles` を読み取り、管理者のみ「承認待ち」・「週次アクティビティ」ウィジェットを右サイドバーに表示。
      - 変更点（feature/dashboard_searchlist ブランチ）: 左サイドバーにブランド `Ginga` を追加し、サイドバー開閉トグル（localStorage に状態保存）を実装。管理者向けウィジェットは管理者ユーザーのみ表示。
    - QuickSearch.tsx: クイック検索コンポーネント（`GET /api/v1/knowledge` を呼び出し、デバウンス付きサジェスト表示・検索結果ページへの遷移）。
    - QuickSearch.module.css: `QuickSearch` 専用のモジュール CSS。
    - QuickTags.tsx: タグ一覧コンポーネント（`GET /api/v1/tags` を呼び出してタグチップを表示、クリックでタグ検索ページへ遷移）。
    - QuickTags.module.css: `QuickTags` 専用のモジュール CSS。
    - SearchResultView.tsx: 検索結果画面（SCR-04）のメインクライアントコンポーネント（`useSearchParams` でクエリを受け取り、`GET /api/v1/knowledge` および `GET /api/v1/tags` を呼び出して検索結果と右サイドバーを統合したレイアウトを提供）。
    - SearchResultList.tsx: 検索結果の記事一覧を表示するコンポーネント（カード形式でタイトル・タグ・投稿者・投稿日を表示、ページネーション付き）。
    - SearchSidebar.tsx: 検索結果画面の右サイドバーコンポーネント（結果件数表示・タグ絞り込みボタン一覧）。
    - Sidebar.tsx: ダッシュボード共通の左ナビサイドバーコンポーネント（サイドバー開閉トグル）。localStorage `currentUser` から `isAdmin`/`roles` を読み取り、管理者のみ「承認」・「管理者パネル」リンクを表示。一般ユーザーにはこれらのリンクは非表示。
  - lib/
    - auth.ts: フロントエンドの認証ユーティリティ。`POST /api/v1/auth/login` 呼び出し（リクエスト: `{ email, password }`、レスポンス: `{ accessToken, refreshToken, expiresIn, user }`）。`UserResponse` ・ `LoginResponse` 型定義を提供。
    - fetcher.ts: 汎用 fetch ユーティリティ（Authorization ヘッダー自動付与、非 OK レスポンス例外化）。
    - mockPosts.ts: 開発/テスト用のモック投稿データ。
  - dashboard/
    - page.tsx: `/dashboard` 用のページ。`CommonHeader` と `Dashboard` コンポーネントをレンダリング。
    - CommonHeader.tsx: ダッシュボード共通ヘッダーのクライアントコンポーネント（検索入力を左寄せに移動、ヘッダ内のブランド/ページリンクとヘッダ内の `＋ 新規投稿` を削除し、通知/アバターは維持）。
  - login/
    - page.tsx: `/login` 用のページ。`LoginForm` を組み合わせてログイン画面を構築。`POST /api/v1/auth/login` 呼び出し後、`accessToken`/`refreshToken` を localStorage に保存。続いて `GET /api/v1/users/me`、`GET /api/v1/dashboard`、`GET /api/v1/dashboard/activity`、`GET /api/v1/knowledge` を並列取得。`currentUser`（管理者フラグ含む）を localStorage に保存した後、`/dashboard` へ遷移。`/register` へのリンクを表示。
  - register/
    - page.tsx: `/register` 用のページ（SCR-02）。`RegisterForm` を組み合わせて会員登録画面を構築。登録成功後は `/login` へ遷移。
  - my_post_list/
    - page.tsx: マイ投稿一覧ページのエントリ。`MyPostList` を使用してユーザー投稿を表示。
  - search_list/
    - page.tsx: `/search_list` 用の検索結果一覧ページ（SCR-04）。`CommonHeader` と `SearchResultView`（`<Suspense>` でラップ）をレンダリング。URL クエリパラメータ: `q`（キーワード）、`tags`（カンマ区切りタグ）、`page`（ページ番号）。
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
    - search_list.module.css: 検索結果一覧画面（SCR-04）固有のモジュール CSS（検索バー・結果カード・ページネーション・右サイドバーのスタイル）。
    - components/: コンポーネント単位の CSS モジュールや共通スタイルを格納。
      - card.module.css: カードUI用のモジュールCSS。
      - header.module.css: ヘッダー用のモジュールCSS。

補足:
- コンポーネント実装は `app/components` 配下で再利用可能な UI とロジックを分離しており、ページは `app/*/page.tsx` でルーティングに対応しています。
- `lib` は API 呼び出しや認証などのユーティリティ集で、テストや Storybook 的な用途で `mockPosts.ts` などのモックが用意されています。

生成日時: 2026-02-25（ログイン画面修正（SCR-01）実装に伴い更新）
