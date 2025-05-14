<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { getInitials } from '@/utils/getInitials'
import { search } from '@/stores/user'
import { getParticipantByProjectId } from '@/stores/participant'
import {
  invite,
  INVITATION_STATUS,
  remove,
  getInvitationsByProjectId,
  getInvitationStatus,
} from '@/stores/invitations'
import { useRoute } from 'vue-router'
import type {
  ProjectParticipantPublic,
  UserPublic,
  InvitationsStatus,
  InvitationsSelectable,
} from '@server/shared/types'

const route = useRoute()
const searchQuery = ref('')
const invitations = ref<InvitationsSelectable[]>([])
const users =
  ref<(UserPublic & { status?: InvitationsStatus; showDetails?: ReturnType<typeof ref> })[]>()
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const participants = ref()
type UserExtended = UserPublic & { status?: InvitationsStatus; showDetails: ReturnType<typeof ref> }
const projectId = route.params.id as string

const noParticipants = computed<UserExtended[]>(() => {
  const getStatus = getInvitationStatus(invitations.value)

  if (!participants.value || !users.value) return []

  const participantsIds = participants.value.map(
    (participant: ProjectParticipantPublic) => participant.userId
  )

  return users.value
    .filter((user: UserPublic) => {
      return !participantsIds.includes(user.id)
    })
    .map((user) => {
      return { ...user, showDetails: ref(false), status: getStatus(user.id) }
    })
})

onMounted(async () => {
  participants.value = await getParticipantByProjectId(projectId)
  invitations.value = await getInvitationsByProjectId(projectId)
})

const getStatusText = (status?: InvitationsStatus): string => {
  switch (status) {
    case INVITATION_STATUS.DECLINED:
      return 'Invitation declined'
    case INVITATION_STATUS.PENDING:
      return 'Invitation sent'
    default:
      return ''
  }
}

const inviteParticipant = async (invitedUserId: string) => {
  await invite({ invitedUserId, projectId })

  invitations.value = await getInvitationsByProjectId(projectId)
}

const cancelInvitation = async (invitedUserId: string) => {
  await remove({ invitedUserId, projectId })

  invitations.value = await getInvitationsByProjectId(projectId)
}

const toggleDetails = (user: UserExtended) => {
  user.showDetails.value = !user.showDetails.value
}

const handleSearch = async () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(async () => {
    users.value = await search(searchQuery.value)
  }, 300)
}
</script>
<template>
  <div class="search-container">
    <h1 class="title">Add Participant</h1>
    <input
      @input="handleSearch"
      v-model="searchQuery"
      data-testid="search"
      type="text"
      class="search-input"
      placeholder="Search by name..."
    />

    <div class="participant-list">
      <div v-for="user in noParticipants" :key="user?.id" class="participant">
        <div class="top-row" @click="toggleDetails(user)" data-testid="top-row">
          <div class="avatar">{{ getInitials(user?.name) }}</div>
          <div class="data">
            <p class="name">{{ user?.name }}</p>

            <p data-testid="invitation-status">{{ getStatusText(user.status) }}</p>
          </div>
        </div>
        <div v-if="(user as UserExtended).showDetails.value" class="bottom-row">
          <button
            v-if="user.status !== INVITATION_STATUS.PENDING"
            data-testid="add"
            class="add-btn"
            @click="inviteParticipant(user.id)"
          >
            Invite
          </button>
          <button v-else data-testid="cancel" class="cancel-btn" @click="cancelInvitation(user.id)">
            Cancel Invitation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.data {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: inherit;
  overflow: hidden;
}

.data p {
  background-color: inherit;
  margin: 0;
}

.top-row {
  display: flex;
  gap: 15px;
  justify-content: flex-start;
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  width: 100%;
}

.bottom-row {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
  background-color: #2c3e50; /* Darker color for better contrast */
  color: white; /* Text color to ensure visibility */
  padding: 10px;
  border-radius: 0 0 8px 8px; /* Match the container's border radius at the bottom */
  overflow: hidden; /* Prevent content from overflowing the border radius */
  box-sizing: border-box; /* Include padding in the element's total width and height */
}

.search-container {
  width: 90%;
  max-width: 400px;
  text-align: center;
  margin: auto;
  padding-top: 20px;
}

.title {
  font-size: var(--mobile-title);
  margin-bottom: 20px;
  color: var(--white);
}

.search-input {
  width: 100%;
  padding: 10px;
  font-size: var(--mobile-text);
  border: none;
  border-radius: 8px;
  background-color: var(--grey-icon);
  color: var(--white);
  outline: none;
}

.participant-list {
  margin-top: 20px;
}

.participant {
  gap: 2vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--grey-icon);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  width: 100%;
}

.avatar {
  width: 40px;
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--button-blue);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: var(--mobile-text);
  margin-right: 10px;
}

.data {
  flex: 1; /* Allow the data section to take up remaining space */
}

.add-btn {
  background-color: var(--button-blue);
  color: var(--white);
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: auto; /* Push the button to the far right */
}

.cancel-btn {
  background-color: var(--button-danger);
  color: var(--white);
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: auto; /* Push the button to the far right */
}

.add-btn:hover {
  background-color: #217dbb;
}
</style>
