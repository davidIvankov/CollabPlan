import { router } from '../trpc'
import forTest from './forTest'
import invitation from './invitation'
import notification from './notification'
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
  notification,
})

export type AppRouter = typeof appRouter
