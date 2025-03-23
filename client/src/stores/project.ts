import { trpc } from '@/trpc'

export const getByCreatedBy = trpc.project.getByCreatedBy.query
export const getProjectById = trpc.project.getById.query
export const createProject = trpc.project.create.mutate
