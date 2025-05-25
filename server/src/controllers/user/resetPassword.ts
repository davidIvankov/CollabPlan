import { createHash } from 'crypto'
import { passwordResetSchema } from '@server/entities/shared'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { hash } from 'bcrypt'
import config from '@server/config'
import { passwordResetRepository } from '../../repositories/passwordResetTokenRepository'

export default publicProcedure
  .use(provideRepos({ userRepository, passwordResetRepository }))
  .input(passwordResetSchema)
  .mutation(async ({ input: { token, password }, ctx: { repos } }) => {
    const hashedToken = createHash('sha256')
      .update(decodeURIComponent(token))
      .digest('hex')

    const validToken = await repos.passwordResetRepository.remove(hashedToken)

    if (!validToken) {
      throw new TRPCError({
        message: 'failed to reset password.',
        code: 'BAD_REQUEST',
      })
    }
    const { userId: id } = validToken

    const passwordHash = await hash(password, config.auth.passwordCost)

    await repos.userRepository.updatePassword({ password: passwordHash, id })

    return {
      completed: true,
      message: 'password reset was successful.',
    }
  })
