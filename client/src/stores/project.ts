import { trpc } from '@/trpc'
import type { ProjectByParticipant, ProjectPublic } from '@server/shared/types'
import { ref } from 'vue'

export const getByParticipant = trpc.project.getByParticipant.query
export const getByCreatedBy = trpc.project.getByCreatedBy.query
export const getProjectById = trpc.project.getById.query
export const createProject = trpc.project.create.mutate
export const updateProject = trpc.project.update.mutate
export const removeProject = trpc.project.deleteProject.mutate

export const usersProjects = ref<ProjectPublic[]>([])

export const participatingIn = ref<ProjectByParticipant[]>([])

export const updateUsersProjects = async (id: string) => {
  usersProjects.value = await getByCreatedBy(id)
}

export const updateParticipatingIn = async (id: string) => {
  participatingIn.value = await getByParticipant(id)
}
