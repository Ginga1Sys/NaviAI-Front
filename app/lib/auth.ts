export type UserResponse = {
  id: number
  username: string
  email: string
  displayName: string
  roles?: string[]
  isAdmin?: boolean
  createdAt: string
}

export type LoginResponse = {
  token: string       // バックエンドの LoginResponse.token に対応
  refreshToken: string
  expiresIn: number
  user: UserResponse
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernameOrEmail: email, password }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error((data && data.message) || "認証に失敗しました。")
  }

  return data as LoginResponse
}
