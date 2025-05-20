import { NOTIFICATION_TYPE } from '@server/database/dbConstants'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'

export default authenticatedProcedure
  .input(z.number().int())
  .use(provideRepos({ notificationRepository }))
  .query(async ({ input: page, ctx: { repos, authUser } }) =>
    repos.notificationRepository.get({
      userId: authUser.id,
      type: NOTIFICATION_TYPE.PROJECT_UPDATE,
      page,
    })
  )
