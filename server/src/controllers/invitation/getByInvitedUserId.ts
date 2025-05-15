import { invitationsRepository } from '@server/repositories/invitationsRepository'
import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository, invitationsRepository }))
  .query(async ({ ctx: { authUser, repos } }) =>
    repos.invitationsRepository.getByInvitedUserId(authUser.id)
  )
