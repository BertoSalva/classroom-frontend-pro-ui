import { http } from './http'

export type ResourceDto = {
  id: number
  classroomId: number
  originalFileName: string
  fileName?: string
  title: string
  category: string
  uploadedAt: string
  resourceYear?: string | null
  sizeBytes: number
  classroomName?: string
  contentType?: string
}

export type UploadResourceResponse = {
  resourceId: number
  fileName: string
}

export const resourcesApi = {
  listByClassroom: async (classroomId: number) =>
    (await http.get<ResourceDto[]>(`/api/v1/resources/${classroomId}`)).data,

  getAll: async () =>
    (await http.get<ResourceDto[]>('/api/v1/resources/all')).data,

  upload: async (
    classroomId: number,
    file: File,
    teacherId: string | number,
    category: string = 'Past Papers',
    resourceYear?: number
  ) => {
    const form = new FormData()
    form.append('file', file)
    form.append('TeacherUserId', String(teacherId))
    form.append('title', file.name)
    form.append('category', category)
    if (resourceYear) {
      form.append('ResourceYear', `${resourceYear}-01-01T00:00:00Z`)
    }

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