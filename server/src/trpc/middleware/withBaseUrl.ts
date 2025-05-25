import { middleware } from '@server/trpc'

export const withBaseUrl = middleware(async ({ ctx, next }) => {
  const { req } = ctx

  const referer = req?.headers.referer || req?.headers.origin
  let baseUrl: string | undefined

  try {
    baseUrl = referer ? new URL(referer).origin : undefined
  } catch {
    baseUrl = undefined
  }

  return next({
    ctx: {
      baseUrl,
    },
  })
})
