"use client";

import React from 'react';
import Link from 'next/link';

// common_header.html をReactコンポーネントとして再実装
export default function CommonHeader() {
  return (
    <header role="banner" className="topbar" style={{ background: 'var(--primary, #6fb1ff)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', height: '64px', padding: '8px 24px' }}>
        {/* Left: quick search moved left */}
        <form role="search" aria-label="サイト検索" action="/search_list" method="get" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label className="sr-only" htmlFor="dashboard-search">検索</label>
          <input id="dashboard-search" name="q" type="search" placeholder="検索・フィルタ…" aria-label="検索" style={{ width: '320px', height: '40px', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(230, 233, 238, 0.9)' }} />
        </form>

        {/* Right: actions / user (removed brand/nav and new post) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn" aria-haspopup="true" aria-label="通知" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', width: '40px', height: '40px', borderRadius: '6px' }}>🔔</button>
          <div className="row" style={{ alignItems: 'center' }}>
            <button className="avatar" aria-label="ユーザーメニュー" title="アカウント" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#0B3D91', fontWeight: 600, border: 0 }}>
              U
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
