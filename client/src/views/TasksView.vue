<script setup lang="ts">
import { getTasks } from '@/stores/task'
import type { ProjectPublic, TaskSelectable } from '@server/shared/types'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Task from '@/components/Task.vue'
import { getProjectById } from '@/stores/project'

const tasks = ref<TaskSelectable[] | null>(null)
const project = ref<ProjectPublic | null>(null)
const router = useRouter()
const props = defineProps<{ projectId: string; userId: string }>()

const isOwner = computed(() => project.value?.createdBy === props.userId)

onMounted(async () => {
  tasks.value = await getTasks(props.projectId)
  project.value = await getProjectById(props.projectId)
})

const goToAddTask = async () => {
  router.push(`/dashboard/projects/${props.projectId}/add-task`)
}
</script>

<template>
  <div class="tasks-container">
    <h1 class="tasks-title">Project Tasks</h1>
    <button class="add-task-button" @click="goToAddTask" v-if="isOwner">+ Add Task</button>
    <Task v-for="task in tasks" :key="task.id" :task="task" />
  </div>
</template>

<style scoped>
.tasks-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.add-task-button {
  background-color: var(--button-blue);
  color: var(--white);
  font-size: var(--mobile-text);
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}
.tasks-title {
  font-size: var(--mobile-title);
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--text-green);
}
</style>
