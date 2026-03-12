import { http } from './http'

export type ClassroomDto = {
  id: number
  gradeId: number
  gradeName: string
  subjectId: number
  subjectName: string
  categories: string[]
}

export type CreateClassroomRequest = {
  gradeId: number
  subjectId: number
  teacherUserId: string
  categories?: string[]
}

export const classroomsApi = {
  list: async () => (await http.get<ClassroomDto[]>('/api/v1/classrooms')).data,
  create: async (req: CreateClassroomRequest) =>
    (await http.post<ClassroomDto>('/api/v1/classrooms', req)).data,
  enroll: async (classroomId: number, learnerUserId: string) =>
    (await http.post(`/api/v1/classrooms/${classroomId}/enroll/${learnerUserId}`)).data,
}