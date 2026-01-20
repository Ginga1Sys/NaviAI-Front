'use client';
import React from "react";
import "./common_module.css";

export default function PublicHome() {
  return (
    <div className="scr12-root">
      <header className="scr12-topbar container">
        <div className="brand">Ginga ナレッジ</div>
        <div className="search">キーワードで検索</div>
        <div className="auth">
          <button className="btn">ログイン</button>
          <button className="btn" style={{background: "var(--color-accent)", color:"#fff"}}>会員登録</button>
        </div>
      </header>

      <main className="scr12-main">
        <section>
          <div className="scr12-hero">
            <div className="title">今週の注目 — AIで効率化する記事まとめ</div>
            <div className="desc">社内で共有されている注目記事をピックアップ。ログインして全容を確認しましょう。</div>
            <div className="ctas">
              <button className="btn" style={{background:"var(--color-accent)", color:"#fff"}}>ログインして続きを見る</button>
              <button className="btn" style={{background:"transparent", border:"1px solid var(--muted-ghost)"}}>公開記事を読む</button>
            </div>
          </div>

          <div className="scr12-article-list">
            <div className="scr12-article-row">
              <div className="thumb" />
              <div className="meta">
                <div className="title">はじめての社内AI活用ガイド</div>
                <div className="excerpt">実践的なテンプレートと注意点を紹介します。</div>
              </div>
              <div className="badge">公開</div>
            </div>

            <div className="scr12-article-row">
              <div className="thumb" style={{background:"#FFF7EA"}} />
              <div className="meta">
                <div className="title">社内データの安全な取り扱い</div>
                <div className="excerpt">アクセス制御とコラボレーションのベストプラクティス。</div>
              </div>
              <div className="badge">公開</div>
            </div>
          </div>
        </section>

        <aside className="scr12-side">
          <div className="widget">
            <div className="title">社内メンバー限定の機能</div>
            <div className="desc">会社ドメインで登録して、投稿・承認フローに参加しましょう。</div>
            <div style={{marginTop:12}}>
              <button className="cta">今すぐ会員登録</button>
            </div>
          </div>

          <div className="widget">
            <div className="title">人気タグ</div>
            <div style={{display:"flex", gap:8, marginTop:8}}>
              <div style={{padding:"6px 12px", borderRadius:14, background:"#EAF2FF", color:"var(--color-primary)"}}>AI</div>
              <div style={{padding:"6px 12px", borderRadius:14, background:"#FFF7EA", color:"#A45A00"}}>セキュリティ</div>
              <div style={{padding:"6px 12px", borderRadius:14, background:"#F3F6F9", color:"var(--color-muted)"}}>運用</div>
            </div>
          </div>

          <div className="scr12-footer-note">未ログイン: 一部コンテンツは制限されます</div>
        </aside>
      </main>
    </div>
  );
}
