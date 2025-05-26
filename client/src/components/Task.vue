<script setup lang="ts">
import { assignTask, deleteTask, markAsDone, unassignTask } from '@/stores/task'
import { authUserId, getUser } from '@/stores/user'
import { formatDateForTemplate, formatSlot, getUserLocalDate } from '@/utils/time'
import type { Slot, TaskSelectable } from '@server/shared/types'
import { onMounted, ref } from 'vue'
import VueMarkdown from 'vue-markdown-render'

const shouldShowForm = ref<boolean>(false)
const isCollapsed = ref(true)
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

const showActualDurationPrompt = ref(false)
const actualDuration = ref<number>(props.task.duration)

const setDone = async () => {
  showActualDurationPrompt.value = true
}

const confirmActualDuration = async () => {
  if (!actualDuration.value || isNaN(Number(actualDuration.value))) {
    alert('Please enter a valid duration in minutes.')
    return
  }
  await markAsDone({ id: props.task.id, actualDuration: actualDuration.value })
  emit('task-updated')
  showActualDurationPrompt.value = false
}

const cancelActualDuration = () => {
  showActualDurationPrompt.value = false
  actualDuration.value = props.task.duration
}

onMounted(async () => {
  if (!props.task.assignedTo) return
  console.log(props.task.createdAt instanceof Date)
  const user = await getUser(props.task.assignedTo)
  userName.value = user.name
})

const isEmptyObject = (obj: unknown): boolean =>
  !!obj && typeof obj === 'object' && Object.keys(obj).length === 0
</script>

<template>
  <div class="task-card" :class="{ collapsed: isCollapsed }">
    <div class="task-header" @click="isCollapsed = !isCollapsed">
      <h2 data-testid="TaskName">{{ task.name }}</h2>
      <span class="task-status" :class="task?.status">{{ task?.status }}</span>
    </div>
    <div class="task-details">
      <VueMarkdown
        :source="task?.description || 'No description provided.'"
        class="task-description"
      />
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
      <p>
        <strong> {{ task.actualDuration ? 'Estimated' : '' }} Duration:</strong>
        {{ task?.duration }} minutes
      </p>
      <p v-if="task.actualDuration">
        <strong>Actual Duration:</strong> {{ task.actualDuration }} minutes
      </p>
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
    <div v-if="showActualDurationPrompt" class="actual-duration-modal">
      <div class="modal-content">
        <label for="actual-duration-input"
          ><strong>How long did it actually take (minutes)?</strong></label
        >
        <input
          id="actual-duration-input"
          v-model="actualDuration"
          type="number"
          min="1"
          class="actual-duration-input"
          placeholder="Enter minutes"
          required
        />
        <div class="modal-actions">
          <button class="btn success" @click="confirmActualDuration">Confirm</button>
          <button class="btn danger" @click="cancelActualDuration">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  transition:
    max-height 0.3s ease,
    padding 0.3s ease;
  overflow: hidden;
  max-height: 1000px; /* large enough for expanded */
  background-color: var(--task-background);
  color: var(--task-font);
  border-radius: 8px;
  padding: 16px; /* Adjust padding for a balanced look */
  margin: 16px;
  max-width: 700px; /* Slightly larger overall size */
  font-size: 16px; /* Slightly larger font size for general text */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.task-card.collapsed {
  max-height: 60px; /* Adjust height to fit the header */
  padding: 0; /* Remove extra padding */
  overflow: hidden;
}
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

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition:
    background-color 0.3s,
    box-shadow 0.3s; /* Smooth transitions */
  padding: 16px; /* Ensure consistent padding within the header */
}

.task-header:hover {
  background-color: rgba(0, 0, 0, 0.1); /* Light background change on hover */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Add a subtle shadow on hover */
  cursor: pointer; /* Change cursor to pointer for interactivity */
}

.task-header h2 {
  font-size: 18px; /* Reduce the task name size */
  margin: 0;
  font-weight: 500; /* Make it less bold */
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

.actual-duration-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  margin: 0 auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.duration-input {
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
