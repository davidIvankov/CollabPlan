import { trpc } from '@/trpc'

export const getTasks = trpc.task.get.query
export const createTask = trpc.task.create.mutate
