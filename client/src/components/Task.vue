<script setup lang="ts">
import { assignTask, deleteTask, markAsDone, unassignTask } from '@/stores/task'
import { authUserId, getUser } from '@/stores/user'
import { formatDateForTemplate, formatSlot, getUserLocalDate } from '@/utils/time'
import type { Slot, TaskSelectable } from '@server/shared/types'
import { onMounted, ref } from 'vue'

const shouldShowForm = ref<boolean>(false)
const props = defineProps<{ task: TaskSelectable; projectCreatedBy: string }>()
const userName = ref('Unassigned')
const scheduledTime = ref({
  userId: authUserId.value as string,
  id: props.task.id,
  date: getUserLocalDate(),
})

const emit = defineEmits(['task-updated'])

const scheduleTask = async () => {
  const slot = formatSlot(scheduledTime.value.date, props.task.duration)
  await assignTask({ id: scheduledTime.value.id, scheduledTime: slot })
  emit('task-updated')
  shouldShowForm.value = false
}

const unassign = async () => {
  await unassignTask(props.task.id)
  emit('task-updated')
}

const removeTask = async () => {
  if (!confirm('are you shore you want to delete this task?')) return
  await deleteTask({ id: props.task.id, projectId: props.task.projectId })
  emit('task-updated')
}

const setDone = async () => {
  if (!confirm('completed task? this action is irreversible!')) return
  await markAsDone(props.task.id)
  emit('task-updated')
}

onMounted(async () => {
  if (!props.task.assignedTo) return
  const user = await getUser(props.task.assignedTo)
  userName.value = user.name
})

const isEmptyObject = (obj: unknown): boolean =>
  !!obj && typeof obj === 'object' && Object.keys(obj).length === 0
</script>

<template>
  <div class="task-card">
    <div class="task-header">
      <h2 data-testid="TaskName">{{ task.name }}</h2>
      <span class="task-status" :class="task?.status">{{ task?.status }}</span>
    </div>
    <div class="task-details">
      <p class="task-description">{{ task?.description || 'No description provided.' }}</p>
      <p><strong>Assigned to:</strong> {{ userName }}</p>
      <p>
        <strong>Scheduled Time:</strong>
        {{ !isEmptyObject(task?.scheduledTime) ? '' : 'Not scheduled' }}
      </p>
      <div v-if="!isEmptyObject(task?.scheduledTime)" class="task-schedule">
        <p class="schedule-label">Start:</p>
        <p class="schedule-date">
          {{ formatDateForTemplate((task?.scheduledTime as Slot).start) }}
        </p>
        <p class="schedule-label">End:</p>
        <p class="schedule-date">{{ formatDateForTemplate((task?.scheduledTime as Slot).end) }}</p>
        <button
          class="btn schedule danger"
          @click="unassign"
          v-if="task.assignedTo === authUserId && task.status !== 'done'"
          data-testid="unassign"
        >
          UNASSIGN
        </button>
      </div>
      <p><strong>Duration:</strong> {{ task?.duration }} minutes</p>
      <p><strong>Created at:</strong> {{ formatDateForTemplate(task?.createdAt.toISOString()) }}</p>
      <button
        class="btn schedule success"
        @click="setDone"
        v-if="task.assignedTo === authUserId && task.status === 'todo'"
      >
        Done
      </button>
      <button
        class="btn schedule"
        @click="shouldShowForm = !shouldShowForm"
        v-if="!task.assignedTo"
        data-testid="Schedule"
      >
        {{ shouldShowForm ? 'Back' : 'Schedule' }}
      </button>
      <form v-if="shouldShowForm" @submit.prevent="scheduleTask">
        <input v-model="scheduledTime.date" type="datetime-local" class="schedule-input" required />
        <button type="submit" data-testid="assign" class="add">+</button>
      </form>
      <button
        class="btn schedule danger"
        @click="removeTask"
        v-if="projectCreatedBy === authUserId"
      >
        DELETE
      </button>
    </div>
  </div>
</template>

<style scoped>
.danger {
  margin-top: 16px;
  background-color: var(--button-danger);
}

.success {
  background-color: var(--text-green);
}
.task-schedule {
  background-color: #f4f4f9; /* Light background */
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Light shadow for depth */
  font-family: Arial, sans-serif; /* Clean font */
  width: 100%; /* Make the container take full width of its parent */
  max-width: 400px; /* Limit the width to a maximum of 400px */
  margin: 16px auto; /* Center the container and add margin */
  box-sizing: border-box; /* Ensures padding is included in the width */
}

.schedule-label {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.schedule-date {
  font-size: 16px;
  color: #555;
  margin-bottom: 12px;
}

.schedule-date:last-child {
  margin-bottom: 0; /* No margin after the last item */
}

.schedule-input {
  border-radius: 8px 8px 0px 0px;
}
.add {
  text-align: center;
  background-color: var(--white);
  width: 100%;
  border-radius: 0px 0px 8px 8px;
  height: 42px;
  font-size: 24px;
}

.form {
  display: flex;
}
.schedule {
  width: calc(100% - 36px);
}

.schedule-input {
  margin-top: 16px;
}
.task-card {
  background-color: var(--task-background);
  color: var(--task-font);
  border-radius: 8px;
  padding: 16px;
  margin: 16px;
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
