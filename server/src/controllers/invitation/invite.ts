import { invitationInputSchema } from '@server/entities/invitation'
import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository }))
  .input(invitationInputSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const project = await repos.projectRepository.getById(input.projectId)

    checkOwnership(project, authUser, 'invite participant to')
  })
