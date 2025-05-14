import { idSchema } from '@server/entities/shared'
import { invitationsRepository } from '@server/repositories/invitationsRepository'
import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository, invitationsRepository }))
  .input(idSchema)
  .query(async ({ input, ctx: { authUser, repos } }) => {
    const project = await repos.projectRepository.getById(input)

    checkOwnership(project, authUser, 'to get invitations of')

    return repos.invitationsRepository.getByProjectId(input)
  })
