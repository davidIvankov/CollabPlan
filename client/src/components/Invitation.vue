<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from 'vue'
import type { InvitationByInvitedUserId } from '@server/shared/types'
import { refreshInvitations, setSeen } from '@/stores/notification'
import type { InvitationUpdateClient } from '@/stores/invitations'

const props = defineProps<{
  invitation: InvitationByInvitedUserId
  acceptInvitation: (arg: InvitationUpdateClient) => Promise<void>
  declineInvitation: (arg: InvitationUpdateClient) => Promise<void>
}>()

const extendedInvitation = ref<ExtendedInvitation>()
onMounted(async () => {
  extendedInvitation.value = { ...props.invitation, showDetails: false }
})

onUnmounted(async () => {
  await refreshInvitations()
})

type ExtendedInvitation = InvitationByInvitedUserId & { showDetails: boolean }

const toggleDetails = (item: ExtendedInvitation) => {
  item.showDetails = !item.showDetails
  extendedInvitation.value = item
}
</script>
<template>
  <li class="invitation-item" v-if="extendedInvitation">
    <div
      class="invitation-details top-row"
      data-testid="invitation"
      @click="toggleDetails(extendedInvitation)"
    >
      <p class="projectName">
        project name:
        <strong>{{ extendedInvitation.projectName }}</strong>
      </p>
      <p class="userName">
        sent by:
        {{ extendedInvitation.invitedByName }}
      </p>
    </div>
    <div class="invitation-actions bottom-row" v-if="extendedInvitation.showDetails">
      <button
        @click="acceptInvitation({ id: invitation.id, projectId: invitation.projectId })"
        class="accept-button"
        data-testid="accept"
      >
        Accept
      </button>
      <button
        @click="declineInvitation({ id: invitation.id, projectId: invitation.projectId })"
        class="decline-button"
      >
        Decline
      </button>
    </div>
  </li>
</template>

<style scoped>
.invitation-item {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 10px;
  background-color: var(--background-grey);
  box-shadow: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  width: 100%;
}

.invitation-details {
  flex: 1;
}

.projectName {
  margin: 0; /* Remove any default margin */
  padding: 0; /* Remove any default padding */
}

.userName {
  margin: 0; /* Remove any default margin */
  padding: 0; /* Remove any default padding */
}

.top-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  padding: 5px; /* Reduce padding */
  border-radius: 10px 10px 0 0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.bottom-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #2c3e50; /* Darker color for better contrast */
  color: white; /* Text color to ensure visibility */
  padding: 10px;
  overflow: hidden; /* Prevent content from overflowing the border radius */
}

.invitation-actions {
  display: flex;
  gap: 10px;
}

.accept-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.accept-button:hover {
  background-color: #45a049;
}

.decline-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.decline-button:hover {
  background-color: #e53935;
}
</style>
