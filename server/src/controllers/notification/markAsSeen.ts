import { idSchema } from '@server/entities/shared'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ notificationRepository }))
  .input(idSchema)
  .mutation(async ({ input: id, ctx: { repos, authUser } }) => {
    const update = await repos.notificationRepository.markAsSeen({
      userId: authUser.id,
      id,
    })
    if (!update) {
      throw new TRPCError({
        message: 'you are not authorized to update this record',
        code: 'UNAUTHORIZED',
      })
    }

    return update
  })
