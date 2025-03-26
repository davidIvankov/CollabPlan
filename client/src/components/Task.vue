<script setup lang="ts">
import type { TaskSelectable } from '@server/shared/types'

defineProps<{ task: TaskSelectable }>()

const isEmptyObject = (obj: unknown): boolean =>
  !!obj && typeof obj === 'object' && Object.keys(obj).length === 0
</script>

<template>
  <div class="task-card">
    <div class="task-header">
      <h2>{{ task.name }}</h2>
      <span class="task-status" :class="task?.status">{{ task?.status }}</span>
    </div>
    <div class="task-details">
      <p class="task-description">{{ task?.description || 'No description provided.' }}</p>
      <p><strong>Assigned to:</strong> {{ task?.assignedTo || 'Unassigned' }}</p>
      <p>
        <strong>Scheduled Time:</strong>
        {{ !isEmptyObject(task?.scheduledTime) ? task?.scheduledTime : 'Not scheduled' }}
      </p>
      <p><strong>Duration:</strong> {{ task?.duration }} minutes</p>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background-color: var(--task-background);
  color: var(--task-font);
  border-radius: 8px;
  padding: 16px;
  margin: 16px;
  width: 300px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-header h2 {
  font-size: var(--mobile-title);
  margin: 0;
}

.task-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: bold;
}

.task-details {
  margin-top: 16px;
}

.task-description {
  font-style: italic;
}

.task-details p {
  margin: 8px 0;
}

.task-status.done {
  background-color: #4caf50;
}

.task-status.review {
  background-color: #f39c12;
}

.task-status.todo {
  background-color: #e74c3c;
}
</style>
