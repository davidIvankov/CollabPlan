import { publicProcedure, router, createCallerFactory } from '@server/trpc'
import { z } from 'zod'
import { withBaseUrl } from '../withBaseUrl'

const routes = router({
  getBaseUrl: publicProcedure
    .use(withBaseUrl)
    .input(z.object({}))
    .query(({ ctx }) => ctx.baseUrl),
})

describe('withBaseUrl middleware', () => {
  it('extracts baseUrl from referer header', async () => {
    const ctx = {
      req: {
        headers: {
          referer: 'https://example.com/some/path',
        },
      },
    }
    const caller = createCallerFactory(routes)
    const { getBaseUrl } = caller(ctx as any)
    expect(await getBaseUrl({})).toBe('https://example.com')
  })

  it('extracts baseUrl from origin header if referer is missing', async () => {
    const ctx = {
      req: {
        headers: {
          origin: 'https://originhost.com',
        },
      },
    }
    const caller = createCallerFactory(routes)
    const { getBaseUrl } = caller(ctx as any)
    expect(await getBaseUrl({})).toBe('https://originhost.com')
  })

  it('returns undefined if no referer or origin', async () => {
    const ctx = {
      req: {
        headers: {},
      },
    }
    const caller = createCallerFactory(routes)
    const { getBaseUrl } = caller(ctx as any)
    expect(await getBaseUrl({})).toBeUndefined()
  })

  it('returns undefined if referer is invalid URL', async () => {
    const ctx = {
      req: {
        headers: {
          referer: 'not-a-valid-url',
        },
      },
    }
    const caller = createCallerFactory(routes)
    const { getBaseUrl } = caller(ctx as any)
    expect(await getBaseUrl({})).toBeUndefined()
  })
})
