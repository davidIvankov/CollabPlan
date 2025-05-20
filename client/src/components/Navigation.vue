<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import Invitation from './Invitation.vue'
import Notification from './Notification.vue'
import type { InvitationByInvitedUserId, NotificationResponse } from '@server/shared/types'
import { getInvitationsByUserId, type InvitationUpdateClient } from '@/stores/invitations'
import { createParticipant } from '@/stores/participant'
import { INVITATION_STATUS } from '../stores/invitations'
import { participatingIn, updateParticipatingIn } from '@/stores/project'
import { authUserId } from '@/stores/user'
import {
  getProjectNotifications,
  notifications,
  invitationNotifications,
  getInvitationNotifications,
  refreshNotifications,
  refreshInvitations,
} from '@/stores/notification'
import { showInvitations, showNotifications, toggleOffPanels } from '@/stores/shared'
import { useSSENotifications } from '@/composables/useSSENotifications/useSSENotifications'

const page = ref<number>(1)

const getCount = (res: Ref<NotificationResponse | undefined>) => {
  return res.value?.data?.filter((notification) => !notification.seen).length || 0
}

const notificationNumberNew = computed(() => getCount(notifications))
const invitationNumberNew = computed(() => getCount(invitationNotifications))

const invitations = ref<InvitationByInvitedUserId[]>()

const toggleNotifications = () => {
  if (showInvitations.value) {
    showInvitations.value = false // Close invitations if open
  }
  showNotifications.value = !showNotifications.value
}

useSSENotifications((data) =>
  data.type === 'INVITATION' ? refreshInvitations() : refreshNotifications()
)

onMounted(async () => {
  notifications.value = await getProjectNotifications(1)
  invitationNotifications.value = await getInvitationNotifications(1)
})

const toggleInvitations = async () => {
  invitations.value = await getInvitationsByUserId()
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

const loadNotifications = async () => {
  page.value++
  const { data, hasMore } = await getProjectNotifications(page.value)
  notifications.value = {
    data: [...(notifications.value as NotificationResponse).data, ...data],
    hasMore,
  }
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
    <div @click="toggleOffPanels" class="nav-container">
      <router-link to="/dashboard/profile" class="nav-item" active-class="active">
        <span class="icon">🏠</span>
        <span class="label">Home</span>
      </router-link>
    </div>

    <div @click="toggleOffPanels" class="nav-container">
      <router-link to="/dashboard/projects" class="nav-item" active-class="active">
        <span class="icon">📂</span>
        <span class="label">Projects</span>
      </router-link>
    </div>
    <button
      class="nav-item notifications"
      :class="showNotifications ? 'active' : ''"
      @click.prevent="toggleNotifications"
      style="position: relative"
    >
      <span class="icon">🔔</span>
      <span class="label">Notifications</span>
      <span v-if="notificationNumberNew > 0" class="notification-badge">{{
        notificationNumberNew
      }}</span>
    </button>
    <button
      class="nav-item invitations"
      :class="showInvitations ? 'active' : ''"
      data-testid="invitations"
      @click.prevent="toggleInvitations"
      style="position: relative"
    >
      <span class="icon">📩</span>
      <span class="label">Invitations</span>
      <span v-if="invitationNumberNew > 0" class="notification-badge">{{
        invitationNumberNew
      }}</span>
    </button>
  </nav>
  <div v-if="showNotifications" class="notifications-panel">
    <ul class="notification-list">
      <Notification
        v-for="notification in notifications?.data"
        :key="notification.id"
        :notification="notification"
      />
    </ul>

    <button v-if="notifications?.hasMore" @click="loadNotifications">More</button>
    <p v-if="notifications?.data?.length === 0">No new notifications</p>
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
.notification-badge {
  position: absolute;
  top: 8px;
  right: 18px;
  min-width: 18px;
  height: 18px;
  background: #e53935;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
  padding: 0 5px;
  box-shadow: 0 0 2px #222;
}
ul {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  gap: 2vw;
  padding: 0;
  margin: 0;
  max-height: 80vh;
  overflow: scroll;
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

.nav-container {
  width: calc(100%);
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
  bottom: 100px; /* Same position for both panels */
  right: 10px;
  width: 300px;
  color: white;
  background-color: #444;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 1001;
}

.notifications-panel {
  width: calc(100vw - 68px);
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
    left: 160px;
    width: 360px; /* Reduced width for desktop view */
  }

  .notifications-panel > ul,
  .invitations-panel > ul {
    gap: 10px;
  }
}
</style>
