import { router } from '@server/trpc'
import create from './create'
import assign from './assign'
import get from './get'
import setDone from './setDone'
import remove from './remove'
import unassign from './unassign'

export default router({
  create,
  assign,
  setDone,
  get,
  remove,
  unassign,
})
