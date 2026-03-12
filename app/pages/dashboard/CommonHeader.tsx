"use client";

import React from 'react';
import styles from './CommonHeader.module.css';

// common_header.html をReactコンポーネントとして再実装
export default function CommonHeader() {
  return (
    <header role="banner" className={`topbar ${styles.header}`}>
      <div className={`container ${styles.inner}`}>
        {/* Left: quick search moved left */}
        <form role="search" aria-label="サイト検索" action="/search_list" method="get" className={styles.searchForm}>
          <label className="sr-only" htmlFor="dashboard-search">検索</label>
          <input
            id="dashboard-search"
            name="q"
            type="search"
            placeholder="検索・フィルタ…"
            aria-label="検索"
            className={styles.searchInput}
          />
        </form>

        {/* Right: actions / user (removed brand/nav and new post) */}
        <div className={styles.actions}>
          <button className={`btn ${styles.notifyButton}`} aria-haspopup="true" aria-label="通知">🔔</button>
          <div className={`row ${styles.avatarWrap}`}>
            <button className={styles.avatarButton} aria-label="ユーザーメニュー" title="アカウント">
              U
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
