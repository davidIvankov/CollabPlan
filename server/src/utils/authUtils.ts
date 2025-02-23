import { TRPCError } from '@trpc/server'
import type { ProjectPublic } from '@server/entities/project'
import type { AuthUser } from '../entities/user'

export const checkOwnership = (
  project: ProjectPublic | undefined,
  authUser: AuthUser,
  message: string
) => {
  if (!project) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Project not found`,
    })
  }

  if (project.createdBy !== authUser.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: `You are not authorized to ${message} this project because you are not the creator.`,
    })
  }
  return true
}
