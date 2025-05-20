import { router } from '@server/trpc'
import getInvitationNotifications from './getInvitationNotifications'
import getProjectNotifications from './getProjectNotifications'
import markAsSeen from './markAsSeen'

export default router({
  getInvitationNotifications,
  getProjectNotifications,
  markAsSeen,
})
