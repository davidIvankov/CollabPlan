import { router } from '@server/trpc'
import create from './create'
import setAvailability from './setAvailability'
import changeRole from './changeRole'
import remove from './remove'
import removeAvailability from './removeAvailability'
import getByProjectId from './getByProjectId'

export default router({
  create,
  setAvailability,
  changeRole,
  remove,
  removeAvailability,
  getByProjectId,
})
