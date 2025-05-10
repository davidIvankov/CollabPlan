<script setup lang="ts">
import { getTasks } from '@/stores/task'
import type { ProjectPublic, TaskSelectable } from '@server/shared/types'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Task from '@/components/Task.vue'
import { getProjectById } from '@/stores/project'
import type { ParticipantSelected } from '@server/shared/types'
import { getParticipantByProjectId } from '@/stores/participant'
import { isInDateRange } from '@/utils/time'

const tasks = ref<any[]>([] as TaskSelectable[])
const participants = ref<ParticipantSelected[]>()
const tasksForDisplay = ref<any[]>([] as TaskSelectable[])
const project = ref<ProjectPublic | null>(null)
const router = useRouter()
const props = defineProps<{ projectId: string; userId: string }>()
const searchQuery = ref<string>('')
const isWideScreen = ref(false)
type FilterForm = {
  participants: string[]
  status: ('unassigned' | 'assigned' | 'done')[]
  range: { from: string | null; to: string | null }
}
const filterForm = ref<FilterForm>({
  participants: [],
  status: ['assigned', 'unassigned', 'done'],
  range: { from: null, to: null },
})
const displayTaskGroups = ref<('unassigned' | 'assigned' | 'done')[]>(filterForm.value.status)
const updateScreenWidth = () => {
  isWideScreen.value = window.matchMedia('(min-width: 1024px)').matches
}

const emit = defineEmits(['task-updated'])
const isOwner = computed(() => project.value?.createdBy === props.userId)

onMounted(async () => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth)
  tasks.value = await getTasks(props.projectId)
  tasksForDisplay.value = tasks.value
  project.value = await getProjectById(props.projectId)
  participants.value = await getParticipantByProjectId(project.value.id)
  filterForm.value.participants = participants.value.map((participant) => participant.userId)
})

const handleSearch = () => {
  tasksForDisplay.value = tasks.value.filter((task: TaskSelectable) =>
    task.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  ) as TaskSelectable[]
}
const unassignedTasks = computed(() =>
  tasksForDisplay.value.filter((task: TaskSelectable) => !task?.assignedTo)
)

const assignedTasks = computed(() =>
  (tasksForDisplay.value as TaskSelectable[])?.filter(
    (task: TaskSelectable) => task?.assignedTo && task?.status === 'todo'
  )
)

const completedTasks = computed(() =>
  (tasksForDisplay.value as TaskSelectable[])?.filter(
    (task: TaskSelectable) => task?.status === 'done'
  )
)
const reloadTasks = async () => {
  tasks.value = await getTasks(props.projectId)
  tasksForDisplay.value = tasks.value
  emit('task-updated')
}

const goToAddTask = async () => {
  router.push(`/dashboard/projects/${props.projectId}/add-task`)
}

const showFilterForm = ref(false)
const expandedSections = ref({
  users: false,
  status: false,
  dates: false,
})

const toggleFilterForm = () => {
  showFilterForm.value = !showFilterForm.value
}

const toggleSection = (section: 'users' | 'status' | 'dates') => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const applyFilters = () => {
  tasksForDisplay.value = tasks.value.filter(
    (task: TaskSelectable) =>
      filterForm.value.participants.includes(task.assignedTo as string) || task.assignedTo === null
  )
  displayTaskGroups.value = filterForm.value.status
  console.log(filterForm.value.range.from)
  tasksForDisplay.value = tasksForDisplay.value.filter((task) => {
    return isInDateRange(task.createdAt, filterForm.value.range.from, filterForm.value.range.to)
  })
}
</script>

<template>
  <div class="tasks-container">
    <h1 class="tasks-title">Project Tasks</h1>
    <button class="add-task-button" data-testid="addTask" @click="goToAddTask" v-if="isOwner">
      + Add Task
    </button>

    <form class="search-form">
      <div class="form-group">
        <input
          @input="handleSearch"
          v-model="searchQuery"
          type="text"
          id="searchField"
          name="searchField"
          placeholder="Type to search..."
        />
      </div>
    </form>

    <button class="filter-button" @click="toggleFilterForm">Filter</button>

    <form v-if="showFilterForm" class="filter-form" @submit.prevent="applyFilters">
      <div class="form-group">
        <label @click="toggleSection('users')">Users:</label>
        <div v-if="expandedSections.users || isWideScreen" class="checkbox-group">
          <div v-for="participant in participants" :key="participant.userId">
            <input
              type="checkbox"
              :id="participant.userId"
              name="user"
              v-model="filterForm.participants"
              :value="participant.userId"
            />
            <label :for="participant.userId">{{ participant.name }}</label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label @click="toggleSection('status')">Task Status:</label>
        <div v-if="expandedSections.status || isWideScreen" class="checkbox-group">
          <input
            type="checkbox"
            id="assigned"
            name="status"
            value="assigned"
            v-model="filterForm.status"
          />
          <label for="assigned">Assigned</label>

          <input
            type="checkbox"
            id="unassigned"
            name="status"
            v-model="filterForm.status"
            value="unassigned"
          />
          <label for="unassigned">Unassigned</label>

          <input type="checkbox" id="done" name="status" v-model="filterForm.status" value="done" />
          <label for="done">Done</label>
        </div>
      </div>

      <div class="form-group">
        <label @click="toggleSection('dates')">Dates:</label>
        <div v-if="expandedSections.dates || isWideScreen">
          <label for="startDate">Start Date:</label>
          <input type="date" id="startDate" name="startDate" v-model="filterForm.range.from" />
          <label for="endDate">End Date:</label>
          <input type="date" id="endDate" name="endDate" v-model="filterForm.range.to" />
        </div>
      </div>

      <button class="apply-button" @click="applyFilters">Apply</button>
    </form>

    <div class="task-section" v-if="displayTaskGroups?.includes('unassigned')">
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

    <div class="task-section" v-if="displayTaskGroups?.includes('assigned')">
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

    <div class="task-section" v-if="displayTaskGroups?.includes('done')">
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

.filter-button {
  background: var(--grey-icon);
  color: var(--white);
  font-size: var(--mobile-text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.3s ease,
    transform 0.2s ease;
  padding: 10px 16px;
  margin-bottom: 16px;
}

.filter-button:hover {
  background: #555555; /* Slightly lighter grey for hover effect */
  transform: scale(1.05); /* Slightly enlarge on hover */
}

.apply-button {
  background: var(--grey-icon);
  color: var(--white);
  font-size: var(--mobile-text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.3s eas e,
    transform 0.2s ease;
  padding: 10px 16px;
  margin-bottom: 16px;
}

.apply-button:hover {
  background: #555555; /* Slightly lighter grey for hover effect */
  transform: scale(1.05); /* Slightly enlarge on hover */
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--background-grey);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 16px; /* Added separation between sections */
  padding-bottom: 8px; /* Added padding for visual separation */
  border-bottom: 1px solid var(--grey-icon); /* Added a bottom border for separation */
}

.form-group:last-of-type {
  border-bottom: none; /* Remove border for the last section */
  margin-bottom: 0; /* Remove extra margin for the last section */
}

.form-group label {
  cursor: pointer;
  transition:
    color 0.3s ease,
    transform 0.2s ease;
}

.form-group label:hover {
  color: var(--button-blue);
  transform: translateX(5px); /* Slightly move to the right on hover */
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0; /* Removed margin between checkboxes */
}

.checkbox-group label {
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 8px;
  border-radius: 4px;
  background-color: var(--grey-icon);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-group input[type='checkbox'] {
  opacity: 0;
}

.checkbox-group input[type='checkbox']:checked + label {
  background-color: var(--button-blue); /* Change background when checked */
  color: var(--white); /* Ensure text is visible */
}

input[type='date'] {
  padding: 8px;
  font-size: var(--mobile-text);
  border: 1px solid var(--grey-icon);
  border-radius: 4px;
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

/* Search Form */
.search-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--background-grey);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: var(--mobile-text);
  font-weight: bold;
  color: var(--text-green);
}

input {
  padding: 8px;
  font-size: var(--mobile-text);
  border: 1px solid var(--grey-icon);
  border-radius: 4px;
}

/* Media query for desktop screens (min-width: 1024px) */
@media (min-width: 1024px) {
  .apply-button {
    grid-column: span 3; /* Make the "Add Task" button span all three columns */
    text-align: center;
  }
  .tasks-container {
    display: grid; /* Use CSS Grid for layout */
    grid-template-columns: repeat(3, 1fr); /* Create three equal columns */
    gap: 24px; /* Add spacing between columns */
    margin-top: 32px; /* Add more spacing on top for desktop */
  }

  .filter-form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    max-width: 50%;
    grid-column: span 3; /* Make the "Filter" button span all three columns */
    margin: 0 auto; /* Center the button */
  }
  .task-section {
    background: var(--background-grey);
    padding: 16px;
  }
  .search-form {
    width: 50%;
    grid-column: span 3; /* Make the "Add Task" button span all three columns */
    margin: 0 auto;
  }
  .add-task-button {
    grid-column: span 3; /* Make the "Add Task" button span all three columns */
    max-width: 300px; /* Limit the width of the button */
    margin: 0 auto; /* Center the button */
  }

  .filter-button {
    grid-column: span 3; /* Make the "Filter" button span all three columns */
    width: 50%;
    text-align: center;
    margin: 0 auto; /* Center the button */
  }

  .tasks-title {
    grid-column: span 3; /* Make the title span all three columns */
    margin-bottom: 16px;
  }
}
</style>
