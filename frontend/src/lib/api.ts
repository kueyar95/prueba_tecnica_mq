const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  })
  if (!res.ok) {
    let message = `Error ${res.status}`
    let code: string | undefined
    try {
      const body = await res.json()
      if (body?.error) {
        message = body.error.message
        code = body.error.code
      } else if (body?.detail) {
        message = body.detail
      } else {
        message = JSON.stringify(body)
      }
    } catch {
      // La respuesta de error no traía JSON parseable: NO traga el error,
      // solo conserva el mensaje por defecto y se lanza igual ApiClientError.
    }
    throw new ApiClientError(res.status, message, code)
  }
  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>)
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, data: unknown) =>
    request<T>(p, { method: "POST", body: JSON.stringify(data) }),
}
