import { createHash, randomBytes } from 'crypto'
import { emailSchema } from '@server/entities/shared'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { emailService } from '@server/services/mailer'
import { withBaseUrl } from '@server/trpc/middleware/withBaseUrl'
import { passwordResetRepository } from '../../repositories/passwordResetTokenRepository'

export default publicProcedure
  .use(withBaseUrl)
  .use(provideRepos({ userRepository, passwordResetRepository }))
  .input(emailSchema)
  .mutation(async ({ input: email, ctx: { repos, baseUrl } }) => {
    const user = await repos.userRepository.findByEmail(email)
    if (!user) {
      return {
        success: true,
        message: 'The password reset link has been sent.',
      }
    }

    const rawToken = randomBytes(32).toString('hex')

    const token = createHash('sha256').update(rawToken).digest('hex')

    await repos.passwordResetRepository.create({ userId: user.id, token })

    await emailService.sendResetEmail(user.email, {
      baseUrl: baseUrl as string,
      token: rawToken,
      userName: user.name,
    })

    return {
      success: true,
      message: 'The password reset link has been sent.',
    }
  })
