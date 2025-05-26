<script setup lang="ts">
import { defineProps, onUnmounted } from 'vue'
import { toggleOffPanels } from '../stores/shared'
import type { NotificationSelectable } from '@server/shared/types'
import { refreshNotifications, setSeen } from '@/stores/notification'
import { timeAgo } from '@/utils/time'

const props = defineProps<{
  notification: NotificationSelectable
}>()
onUnmounted(async () => {
  if (!props.notification.seen) {
    await setSeen(props.notification.id)
    await refreshNotifications()
  }
})
</script>
<template>
  <div @click="toggleOffPanels">
    <router-link
      :to="`/dashboard/projects/${props.notification.projectId}/details`"
      class="notification-item"
      :class="{ seen: props.notification.seen, unseen: !props.notification.seen }"
    >
      <div class="notification-details">
        <p class="icon">❗</p>
        <div class="text-content">
          <p class="message">{{ props.notification.message }}</p>
          <p>{{ timeAgo(props.notification.createdAt.toISOString()) }}</p>
        </div>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.notification-item {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 10px;
  background-color: var(--white);
  box-shadow: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  width: calc(100% - 20px);
  padding: 10px;
  text-decoration: none;
  color: var(--background-grey);
}

.notification-item.unseen {
  background-color: var(--task-background);
}

.notification-item:hover {
  filter: grayscale(0.5);
}

.notification-details {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.icon {
  align-self: center;
  font-size: 20px;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  margin: 0;
  padding: 0;
}

.project {
  margin: 0;
  padding: 0;
}
</style>
