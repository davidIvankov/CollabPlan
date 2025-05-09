<script setup lang="ts">
import { getTasks } from '@/stores/task'
import type { ProjectPublic, TaskSelectable } from '@server/shared/types'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Task from '@/components/Task.vue'
import { getProjectById } from '@/stores/project'

const tasks = ref<any>([] as TaskSelectable[])
const project = ref<ProjectPublic | null>(null)
const router = useRouter()
const props = defineProps<{ projectId: string; userId: string }>()

const emit = defineEmits(['task-updated'])
const isOwner = computed(() => project.value?.createdBy === props.userId)

onMounted(async () => {
  tasks.value = await getTasks(props.projectId)
  project.value = await getProjectById(props.projectId)
})

const unassignedTasks = computed(() =>
  tasks.value?.filter((task: TaskSelectable) => !task?.assignedTo)
)

const assignedTasks = computed(() =>
  tasks.value?.filter((task: TaskSelectable) => task?.assignedTo && task?.status === 'todo')
)

const completedTasks = computed(() =>
  tasks.value?.filter((task: TaskSelectable) => task?.status === 'done')
)
const reloadTasks = async () => {
  tasks.value = await getTasks(props.projectId)
  emit('task-updated')
}

const goToAddTask = async () => {
  router.push(`/dashboard/projects/${props.projectId}/add-task`)
}
</script>

<template>
  <div class="tasks-container">
    <h1 class="tasks-title">Project Tasks</h1>
    <button class="add-task-button" data-testid="addTask" @click="goToAddTask" v-if="isOwner">
      + Add Task
    </button>

    <div class="task-section">
      <h2 class="section-title">Unassigned Tasks</h2>
      <div v-if="unassignedTasks.length" class="task-list" data-testid="unassignedTasks">
        <Task
          v-for="task in unassignedTasks"
          :key="task.id"
          :task="task"
          :projectCreatedBy="project?.createdBy as string"
          @task-updated="reloadTasks"
        />
      </div>
      <p v-else class="empty-state">No unassigned tasks.</p>
    </div>

    <div class="task-section">
      <h2 class="section-title">Assigned Tasks</h2>
      <div v-if="assignedTasks.length" class="task-list" data-testid="assignedTasks">
        <Task
          v-for="task in assignedTasks"
          :key="task.id"
          :task="task"
          :projectCreatedBy="project?.createdBy as string"
          @task-updated="reloadTasks"
        />
      </div>
      <p v-else class="empty-state">No assigned tasks.</p>
    </div>

    <div class="task-section">
      <h2 class="section-title">Completed Tasks</h2>
      <div v-if="completedTasks.length" class="task-list">
        <Task
          v-for="task in completedTasks"
          :key="task.id"
          :task="task"
          :projectCreatedBy="project?.createdBy as string"
          @task-updated="reloadTasks"
        />
      </div>
      <p v-else class="empty-state">No completed tasks.</p>
    </div>
  </div>
</template>

<style scoped>
.tasks-container {
  margin-top: 16px;
  margin-bottom: 10vw;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--background-grey);
}

.tasks-title {
  font-size: var(--mobile-title);
  font-weight: bold;
  color: var(--text-green);
  text-align: center;
  margin: 0;
}

.task-section {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-size: var(--mobile-text);
  font-weight: 600;
  margin: 0;
  padding: 8px 0;
}

.add-task-button {
  background: var(--button-blue);
  color: var(--white);
  font-size: var(--mobile-text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  width: 100%;
  text-align: center;
}

.add-task-button:hover {
  background: #2980b9;
}

/* Task List */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Empty State */
.empty-state {
  text-align: center;
  color: var(--grey-icon);
  font-size: var(--mobile-text);
  font-style: italic;
}

/* Button Danger (For delete or cancel actions) */
.button-danger {
  background: var(--button-danger);
  color: var(--white);
  font-size: var(--mobile-text);
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
}

.button-danger:hover {
  background: #c9302c;
}

/* Media query for desktop screens (min-width: 1024px) */
@media (min-width: 1024px) {
  .tasks-container {
    display: grid; /* Use CSS Grid for layout */
    grid-template-columns: repeat(3, 1fr); /* Create three equal columns */
    gap: 24px; /* Add spacing between columns */
    margin-top: 32px; /* Add more spacing on top for desktop */
  }

  .task-section {
    background: var(--background-grey);
    padding: 16px;
  }

  .add-task-button {
    grid-column: span 3; /* Make the "Add Task" button span all three columns */
    max-width: 300px; /* Limit the width of the button */
    margin: 0 auto; /* Center the button */
  }

  .tasks-title {
    grid-column: span 3; /* Make the title span all three columns */
    margin-bottom: 16px;
  }
}
</style>
