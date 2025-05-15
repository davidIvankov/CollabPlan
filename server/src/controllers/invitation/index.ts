import { router } from '@server/trpc'
import invite from './invite'
import getByProjectId from './getByProjectId'
import remove from './remove'
import getByInvitedUserId from './getByInvitedUserId'

export default router({ invite, getByProjectId, remove, getByInvitedUserId })
