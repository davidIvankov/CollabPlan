import { router } from '../trpc'
import project from './project'
import projectParticipant from './projectParticipant'
import task from './task'
import user from './user'

export const appRouter = router({
  user,
  project,
  projectParticipant,
  task,
})

export type AppRouter = typeof appRouter
