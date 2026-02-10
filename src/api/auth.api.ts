import { http } from './http'

export type RegisterRequest = {
  email: string
  password: string
  fullName: string
  role?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  accessToken: string
}

export const authApi = {
  register: async (req: RegisterRequest) => {
    const { data } = await http.post<AuthResponse>('/api/v1/auth/register', req)
    return data
  },
  login: async (req: LoginRequest) => {
    const { data } = await http.post<AuthResponse>('/api/v1/auth/login', req)
    return data
  },
}
