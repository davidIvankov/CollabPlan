import { trpc } from '@/trpc'

export const getParticipantByProjectId = trpc.projectParticipant.getByProjectId.query
export const createParticipant = trpc.projectParticipant.create.mutate
