import { http } from './http'

export type SubjectDto = {
  id: number
  name: string
  gradeId: number
}

export const subjectsApi = {
  listAll: async () => (await http.get<SubjectDto[]>('/api/v1/subjects/all')).data,
}
