export type LoginResponse = {
  token?: string
  message?: string
}

export async function login(identifier: string, password: string): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error((data && data.message) || "認証に失敗しました。")
  }

  return data as LoginResponse
}
