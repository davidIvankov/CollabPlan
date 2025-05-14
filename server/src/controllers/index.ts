import { router } from '../trpc'
import forTest from './forTest'
import invitation from './invitation'
import project from './project'
import projectParticipant from './projectParticipant'
import task from './task'
import user from './user'

export const appRouter = router({
  user,
  project,
  projectParticipant,
  task,
  invitation,
  forTest,
})

export type AppRouter = typeof appRouter
