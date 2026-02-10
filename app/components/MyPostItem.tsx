"use client"

import React from 'react'
import styles from '../pages/dashboard/my_post_list/my_post_list.module.css'
import { Post } from '../lib/mockPosts'

export default function MyPostItem({ post }: { post: Post }) {
  const getStatusBadge = (status: Post['status']) => {
    switch (status) {
      case '公開':
        return styles.badgePublished;
      case '下書き':
        return styles.badgeDraft;
      case 'レビュー中':
        return styles.badgeReview;
      case '差し戻し':
        return styles.badgeDeclined; // 差し戻し用のスタイルを想定
      default:
        return styles.badgeDraft;
    }
  }

  return (
    <article className={styles.postCard}>
      <div className={styles.postContent}>
        <a href="#" className={styles.postTitle}>{post.title}</a>
        <div className={styles.postMeta}>
          <span>{post.date}</span>
          <span className={`${styles.badge} ${getStatusBadge(post.status)}`}>
            {post.status}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn}>編集</button>
        <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`}>削除</button>
      </div>
    </article>
  )
}
