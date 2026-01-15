# NaviAI-Front

本リポジトリは、AIナレッジ共有サイトの画面（フロントエンド）に関する画面資産を管理するためのリポジトリです。

主な目的:
- デザイン用のHTML/CSSモジュールやコンポーネントスタイルを一元管理する
- 画面共通ヘッダーやモジュールの再利用を容易にする

ディレクトリ構成（`NaviAI-Front/app` 配下）:

```
app/
  pages/
    login/ # SCR-01、SCR-02
    dashboard/ # SCR-03～SCR-11
      common_header.html
      common_module.css
    public-home/ # SCR-12
      common_module.css
      index.tsx
  styles/
    global.css
    tokens.css
    components/
      card.module.css
      header.module.css
```

利用方法（簡単）:
- 各ページは `app/pages` 以下に配置されています。
- 共通スタイルやデザイントークンは `app/styles` にまとめています。
- 新しい画面資産を追加する場合は、該当ディレクトリにファイルを追加し、プルリクエストで共有してください。

---
（補足）実際のファイルの詳細はリポジトリの該当ディレクトリを参照してください。
