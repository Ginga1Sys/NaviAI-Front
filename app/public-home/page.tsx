'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./common_module.css";
import fetcher from "../lib/fetcher";

interface PublicArticle {
  id: number;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  authorDisplayName: string;
  publishedAt: string | null;
  tags: string[];
}

interface PublicArticlesResponse {
  page: number;
  size: number;
  totalElements: number;
  items: PublicArticle[];
}

interface RecommendedArticle {
  id: number;
  title: string;
  likeCount: number;
}

interface RecommendedArticlesResponse {
  items: RecommendedArticle[];
}

interface TagItem {
  name: string;
  count: number;
}

export default function PublicHome() {
  const router = useRouter();
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [recommended, setRecommended] = useState<RecommendedArticle | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));

    const fetchData = async () => {
      try {
        const [recommendedRes, articlesRes, tagsRes] = await Promise.all([
          fetcher<RecommendedArticlesResponse>("/api/v1/public/knowledge/recommended?limit=1", { skipAuth: true }),
          fetcher<PublicArticlesResponse>("/api/v1/public/knowledge?page=0&size=2", { skipAuth: true }),
          fetcher<TagItem[]>("/api/v1/public/tags", { skipAuth: true }),
        ]);
        setRecommended(recommendedRes.items?.[0] ?? null);
        setArticles(articlesRes.items ?? []);
        setTags(tagsRes);
      } catch (e) {
        setError("データの取得に失敗しました。");
        setRecommended(null);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openKnowledge = (id: number) => {
    if (isAuthenticated) {
      router.push(`/knowledge/${id}`);
      return;
    }
    router.push(`/login?redirect=${encodeURIComponent(`/knowledge/${id}`)}`);
  };

  return (
    <div className="scr12-root">
      <header className="scr12-topbar container">
        <div className="brand">Ginga ナレッジ</div>
        <div className="search">キーワードで検索</div>
        <div className="auth">
          <button className="btn" onClick={() => router.push("/login")}>ログイン</button>
          <button
            className="btn"
            style={{ background: "var(--color-accent)", color: "#fff" }}
            onClick={() => router.push("/register")}
          >
            会員登録
          </button>
        </div>
      </header>

      <main className="scr12-main">
        <section>
          <div className="scr12-hero">
            {loading ? (
              <div className="title">読み込み中...</div>
            ) : recommended ? (
              <>
                <div className="title">今週の注目: {recommended.title}</div>
                <div className="desc">
                  いいね数 {recommended.likeCount} 件のおすすめ記事です。
                </div>
              </>
            ) : (
              <>
                <div className="title">データがありません</div>
                <div className="desc">おすすめ記事が登録されていません。</div>
              </>
            )}
            <div className="ctas">
              {recommended && (
                <button
                  className="btn"
                  style={{ background: "var(--color-accent)", color: "#fff" }}
                  onClick={() => openKnowledge(recommended.id)}
                >
                  {isAuthenticated ? "記事を読む" : "ログインして続きを読む"}
                </button>
              )}
              <button
                className="btn"
                style={{ background: "transparent", border: "1px solid var(--muted-ghost)" }}
                onClick={() => {
                  const el = document.querySelector(".scr12-article-list");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                公開記事を読む
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: "var(--color-danger)", marginTop: 16, padding: "8px 12px", background: "#fff0f0", borderRadius: 8 }}>
              {error}
            </div>
          )}

          <div className="scr12-article-list">
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="scr12-article-row" style={{ opacity: 0.5 }}>
                  <div className="thumb" />
                  <div className="meta">
                    <div className="title" style={{ background: "#F3F6F9", height: 16, borderRadius: 4, width: "60%" }} />
                    <div className="excerpt" style={{ background: "#F3F6F9", height: 12, borderRadius: 4, width: "80%", marginTop: 8 }} />
                  </div>
                </div>
              ))
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <div
                  key={article.id}
                  className="scr12-article-row"
                  style={{ cursor: "pointer" }}
                  onClick={() => openKnowledge(article.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") openKnowledge(article.id); }}
                >
                  <div
                    className="thumb"
                    style={article.thumbnail ? { backgroundImage: `url(${article.thumbnail})`, backgroundSize: "cover" } : {}}
                  />
                  <div className="meta">
                    <div className="title">{article.title}</div>
                    <div className="excerpt">
                      {article.excerpt ?? ""}
                      {article.tags.length > 0 && (
                        <span style={{ marginLeft: 8, color: "var(--color-primary)", fontSize: 12 }}>
                          {article.tags.map((t) => `#${t}`).join(" ")}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
                      {article.authorDisplayName && <span>{article.authorDisplayName} · </span>}
                      {article.publishedAt && <span>{new Date(article.publishedAt).toLocaleDateString("ja-JP")}</span>}
                    </div>
                  </div>
                  <div className="badge">公開</div>
                </div>
              ))
            ) : !loading && !error && (
              <div style={{ color: "var(--color-muted)", padding: "16px 0" }}>データがありません</div>
            )}
          </div>
        </section>

        <aside className="scr12-side">
          <div className="widget">
            <div className="title">人気タグ</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {loading ? (
                ["", "", ""].map((_, i) => (
                  <div
                    key={i}
                    style={{ padding: "6px 24px", borderRadius: 14, background: "#F3F6F9", color: "transparent" }}
                  >
                    &nbsp;
                  </div>
                ))
              ) : tags.length > 0 ? (
                tags.slice(0, 10).map((tag) => (
                  <div
                    key={tag.name}
                    style={{ padding: "6px 12px", borderRadius: 14, background: "#EAF2FF", color: "var(--color-primary)", fontSize: 13 }}
                  >
                    {tag.name}
                    {tag.count && (
                      <span style={{ marginLeft: 4, fontSize: 11, color: "var(--color-muted)" }}>({tag.count})</span>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--color-muted)", fontSize: 13 }}>タグはまだありません。</div>
              )}
            </div>
          </div>

          <div className="scr12-footer-note">未ログイン: 一部コンテンツは制限されます</div>
        </aside>
      </main>
    </div>
  );
}
