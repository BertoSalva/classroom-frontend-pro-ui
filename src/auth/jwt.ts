export type JwtPayload = {
  sub?: string
  email?: string
  role?: string | string[]
  exp?: number
  iss?: string
  aud?: string
  [k: string]: unknown
}

function base64UrlDecode(input: string) {
  const pad = '='.repeat((4 - (input.length % 4)) % 4)
  const base64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/')
  const decoded = atob(base64)
  try {
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    return decoded
  }
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload
  } catch {
    return null
  }
}

export function getRoles(payload: JwtPayload | null): string[] {
  if (!payload) return []
  const r =
    payload['role'] ??
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  if (!r) return []
  if (Array.isArray(r)) return r.map(String)
  return [String(r)]
}
