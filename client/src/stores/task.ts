import { trpc } from '@/trpc'

export const getTasks = trpc.task.get.query
export const createTask = trpc.task.create.mutate
export const assignTask = trpc.task.assign.mutate
export const deleteTask = trpc.task.remove.mutate
export const markAsDone = trpc.task.setDone.mutate
export const unassignTask = trpc.task.unassign.mutate
export const estimateTime = trpc.timeEstimation.get.query
