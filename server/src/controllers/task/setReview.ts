import { idSchema } from '@server/entities/shared'
import { taskRepository } from '@server/repositories/taskRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ taskRepository }))
  .input(idSchema)
  .mutation(async ({ input: id, ctx: { authUser, repos } }) => {
    const hasTask =
      (await repos.taskRepository.getById(id)).assignedTo === authUser.id

    if (!hasTask) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'task is not assigned to you.',
      })
    }

    return repos.taskRepository.setStatus(id)
  })
