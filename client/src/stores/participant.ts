import { trpc } from '@/trpc'

export const getParticipantByProjectId = trpc.projectParticipant.getByProjectId.query
