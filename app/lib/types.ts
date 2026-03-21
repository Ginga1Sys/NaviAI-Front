export type Article = {
  id: number | string
  title: string
  excerpt?: string
  author?: string
  publishedAt?: string
  tags?: string[]
}

export type Tag = {
  id?: number | string
  name: string
  count?: number
}

export type ListApiResponse<T> = {
  content?: T[]
  data?: T[]
  items?: T[]
} | T[]

export function normalizeListResponse<T>(res: ListApiResponse<T>): T[] {
  if (Array.isArray(res)) return res
  return res.content ?? res.data ?? res.items ?? []
}
