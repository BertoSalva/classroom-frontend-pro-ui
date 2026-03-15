import { http } from './http'

export type UserWithRolesDto = {
  id: string
  email: string
  fullName: string
  adminId?: string
  roles: string[]
}

export type SetUserRolesRequest = {
  userId: string
  roles: string[]
}

export const usersApi = {
  list: async () => (await http.get<UserWithRolesDto[]>('/api/v1/users')).data,
  setRoles: async (req: SetUserRolesRequest) =>
    (await http.put<UserWithRolesDto>('/api/v1/users/roles', req)).data,
}
