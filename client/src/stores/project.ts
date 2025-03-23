import { trpc } from '@/trpc'

export const getByParticipant = trpc.project.getByParticipant.query
export const getByCreatedBy = trpc.project.getByCreatedBy.query
export const getProjectById = trpc.project.getById.query
export const createProject = trpc.project.create.mutate
export const updateProject = trpc.project.update.mutate
export const removeProject = trpc.project.deleteProject.mutate
