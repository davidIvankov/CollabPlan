import { router } from '@server/trpc'
import create from './create'
import assign from './assign'
import setReview from './setReview'
import reviewTask from './reviewTask'

export default router({
  create,
  assign,
  setReview,
  reviewTask,
})
