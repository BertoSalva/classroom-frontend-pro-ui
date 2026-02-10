import { http } from './http'

export type ClassroomDto = {
  id: number
  name: string
  gradeId: number
  subjectId: number
  teacherUserId: string
}

export type CreateClassroomRequest = {
  name: string
  gradeId: number
  subjectId: number
  teacherUserId: string
}

export const classroomsApi = {
  list: async () => (await http.get<ClassroomDto[]>('/api/v1/classrooms')).data,
  create: async (req: CreateClassroomRequest) =>
    (await http.post<ClassroomDto>('/api/v1/classrooms', req)).data,
  enroll: async (classroomId: number, learnerUserId: string) =>
    (await http.post(`/api/v1/classrooms/${classroomId}/enroll/${learnerUserId}`)).data,
}