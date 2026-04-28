import { http } from './http'

export type RegisterRequest = {
  email: string
  password: string
  fullName: string
  adminId?: string
  role?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  accessToken: string
}

export type RegisterResponse = {
  message?: string
  email?: string
}

export type ConfirmEmailCodeRequest = {
  email: string
  code: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  email: string
  token: string
  newPassword: string
}

export const authApi = {
  register: async (req: RegisterRequest) => {
    const { data } = await http.post<RegisterResponse>('/api/v1/auth/register', req)
    return data
  },
  confirmEmailCode: async (req: ConfirmEmailCodeRequest) => {
    const { data } = await http.post<{ message?: string }>('/api/v1/auth/confirm-email-code', req)
    return data
  },
  login: async (req: LoginRequest) => {
    const { data } = await http.post<AuthResponse>('/api/v1/auth/login', req)
    return data
  },
  forgotPassword: async (req: ForgotPasswordRequest) => {
    await http.post('/api/v1/auth/forgot-password', req)
  },
  resetPassword: async (req: ResetPasswordRequest) => {
    await http.post('/api/v1/auth/reset-password', req)
  },
}
