import { router } from '../trpc'
import project from './project'
import user from './user'

export const appRouter = router({
  user,
  project,
})

export type AppRouter = typeof appRouter
