<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Invitation from './Invitation.vue'
import type { InvitationByInvitedUserId } from '@server/shared/types'
import { getInvitationsByUserId, type InvitationUpdateClient } from '@/stores/invitations'
import { createParticipant } from '@/stores/participant'
import { INVITATION_STATUS } from '../stores/invitations'
import { participatingIn, updateParticipatingIn } from '@/stores/project'
import { authUserId } from '@/stores/user'

const showNotifications = ref(false)
const showInvitations = ref(false)
const invitations = ref<InvitationByInvitedUserId[]>()

const toggleNotifications = () => {
  if (showInvitations.value) {
    showInvitations.value = false // Close invitations if open
  }
  showNotifications.value = !showNotifications.value
}

onMounted(() => {})
const toggleInvitations = async () => {
  invitations.value = invitations.value ? invitations.value : await getInvitationsByUserId()
  if (showNotifications.value) {
    showNotifications.value = false // Close notifications if open
  }
  showInvitations.value = !showInvitations.value
}

const updateInvitations = (id: string) =>
  (invitations.value = invitations.value?.filter((invitation) => invitation.id !== id))

const acceptInvitation = async ({ id, projectId }: InvitationUpdateClient) => {
  const status = INVITATION_STATUS.ACCEPTED
  await createParticipant({ id, projectId, status })

  updateInvitations(id)

  await updateParticipatingIn(authUserId.value as string)
}

const declineInvitation = async ({ id, projectId }: InvitationUpdateClient) => {
  const status = INVITATION_STATUS.DECLINED
  await createParticipant({ id, projectId, status })

  updateInvitations(id)
}

watch(participatingIn, (newVal) => {
  console.log('participatingIn changed:', newVal)
})
</script>

<template>
  <nav class="bottom-nav">
    <router-link to="/dashboard/profile" class="nav-item" active-class="active">
      <span class="icon">🏠</span>
      <span class="label">Home</span>
    </router-link>
    <router-link to="/dashboard/projects" class="nav-item" active-class="active">
      <span class="icon">📂</span>
      <span class="label">Projects</span>
    </router-link>
    <button
      class="nav-item notifications"
      :class="showNotifications ? 'active' : ''"
      @click.prevent="toggleNotifications"
    >
      <span class="icon">🔔</span>
      <span class="label">Notifications</span>
    </button>
    <button
      class="nav-item invitations"
      :class="showInvitations ? 'active' : ''"
      data-testid="invitations"
      @click.prevent="toggleInvitations"
    >
      <span class="icon">📩</span>
      <span class="label">Invitations</span>
    </button>
  </nav>
  <div v-if="showNotifications" class="notifications-panel">
    <p>No new notifications</p>
  </div>
  <div v-if="showInvitations" class="invitations-panel">
    <ul>
      <Invitation
        v-for="invitation in invitations"
        :key="invitation.id"
        :invitation="invitation"
        :acceptInvitation="acceptInvitation"
        :declineInvitation="declineInvitation"
      />
    </ul>
    <p v-if="invitations?.length === 0">No Invitations</p>
  </div>
</template>

<style scoped>
ul {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  gap: 2vw;
  padding: 0;
  margin: 0;
}
.active {
  background-color: var(--grey-icon);
}
.bottom-nav {
  z-index: 1000;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #222; /* Dark background */
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #444;
}

.nav-item {
  width: 50%;
  text-decoration: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  padding: 20px;
  transition: opacity 0.2s ease-in-out;
}

.nav-item:hover {
  opacity: 0.7;
}

.icon {
  font-size: 20px; /* Adjust icon size */
}

.label {
  margin-top: 4px;
}

/* Adjusted positioning to ensure panels occupy the same spot */
.notifications-panel,
.invitations-panel {
  position: fixed;
  bottom: 60px; /* Same position for both panels */
  right: 10px;
  width: 300px;
  color: white;
  background-color: #444;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 1001;
}

.nav-item.notifications:hover,
.nav-item.invitations:hover {
  background-color: var(--grey-icon); /* Keep hover color consistent */
}

.nav-item.notifications.active,
.nav-item.invitations.active {
  background-color: var(--text-green); /* Active state color */
  color: white; /* Ensure text is visible */
}

@media (min-width: 1024px) {
  .bottom-nav {
    position: fixed;
    top: 0;
    justify-content: flex-end;
    left: 0;
    width: 150px; /* Adjust width as needed */
    height: 100%;
    transform: translateX(-85px);
    flex-direction: column-reverse; /* Make navigation vertical */
    border-right: 1px solid #444; /* Add a border to separate from content */
    border-top: none; /* Remove top border */
    transition: transform ease-in-out 0.2s;
  }

  .bottom-nav:hover {
    transform: translateX(0);
  }

  .nav-item {
    width: calc(150px - 30px);
    padding: 15px; /* Adjust padding for vertical layout */
    justify-content: flex-start; /* Align items to the start */
    gap: 1vw;
    flex-direction: row-reverse; /* Align icon and label horizontally */
  }

  .icon {
    margin-right: 10px; /* Add spacing between icon and label */
  }

  .notifications-panel,
  .invitations-panel {
    bottom: auto; /* Reset bottom positioning */
    top: 10px; /* Adjust top positioning */
    left: 220px; /* Position next to the navigation */
  }
}
</style>
