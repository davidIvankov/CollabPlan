import { trpc } from '@/trpc'
import type {
  InvitationsSelectable,
  InvitationsStatus,
  InvitationsUpdatable,
} from '@server/shared/types'

export const invite = trpc.invitation.invite.mutate
export const remove = trpc.invitation.remove.mutate
export const getInvitationsByProjectId = trpc.invitation.getByProjectId.query
export const getInvitationsByUserId = trpc.invitation.getByInvitedUserId.query

export const getInvitationStatus =
  (invitations: InvitationsSelectable[]) =>
  (invitedUserId: string): InvitationsStatus | undefined => {
    if (invitations.length === 0) return undefined
    return invitations.find((invitation) => invitation.invitedUserId === invitedUserId)
      ?.status as InvitationsStatus
  }

export type InvitationUpdateClient = Omit<InvitationsUpdatable, 'status'>

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const
