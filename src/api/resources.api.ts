import { http } from './http'

export type ResourceDto = {
  id: number
  classroomId: number
  fileName: string
  uploadedAt: string
}

export type UploadResourceResponse = {
  resourceId: number
  fileName: string
}

export const resourcesApi = {
  listByClassroom: async (classroomId: number) =>
    (await http.get<ResourceDto[]>(`/api/v1/resources/${classroomId}`)).data,

upload: async (classroomId: number, file: File, teacherId: string | number) => {
  const form = new FormData()
  form.append('file', file)
  form.append('TeacherUserId', String(teacherId))
  form.append('title', file.name) // Add title from filename

  const { data } = await http.post<UploadResourceResponse>(
    `/api/v1/resources/${classroomId}/upload`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
},

  download: async (resourceId: number) => {
    const res = await http.get(`/api/v1/resources/${resourceId}/download`, {
      responseType: 'blob',
    })
    return res.data as Blob
  },
}