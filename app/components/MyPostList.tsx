"use client"

import React from 'react'
import MyPostItem from '../components/MyPostItem'
import styles from '../pages/dashboard/my_post_list/my_post_list.module.css'
import { Post } from '../lib/mockPosts'

type Props = {
  posts: Post[]
}

export default function MyPostList({ posts }: Props) {
  return (
    <ul className={styles.postList}>
      {posts.map((p) => (
        <li key={p.id}>
          <MyPostItem post={p} />
        </li>
      ))}
    </ul>
  )
}
