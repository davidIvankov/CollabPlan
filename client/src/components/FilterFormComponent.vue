<script setup lang="ts">
import type { FilterForm } from '@/utils/sharedTypes'
import type { ParticipantSelected } from '@server/shared/types'
import { ref, onMounted, defineEmits } from 'vue'

const props = defineProps<{ projectId: string; participants: ParticipantSelected[] }>()
const isWideScreen = ref(false)
const expandedSections = ref({
  users: false,
  status: false,
  dates: false,
})

const updateScreenWidth = () => {
  isWideScreen.value = window.matchMedia('(min-width: 1024px)').matches
}

const filterForm = ref<FilterForm>({
  participants: [],
  status: ['assigned', 'unassigned', 'done'],
  range: { from: null, to: null },
})

onMounted(async () => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth)
  filterForm.value.participants = props.participants.map((participant) => participant.userId)
  console.log(filterForm.value.participants)
})

const toggleSection = (section: 'users' | 'status' | 'dates') => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const emit = defineEmits(['submit-filters'])

const applyFilters = () => {
  emit('submit-filters', filterForm.value)
}
</script>

<template>
  <form class="filter-form" @submit.prevent="applyFilters">
    <div class="form-group">
      <label @click="toggleSection('users')">Users:</label>
      <div v-if="expandedSections.users || isWideScreen" class="checkbox-group">
        <div v-for="participant in props.participants" :key="participant.userId">
          <input
            type="checkbox"
            :id="participant.userId"
            name="user"
            :value="participant.userId"
            v-model="filterForm.participants"
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
          v-model="filterForm.status"
          id="assigned"
          name="status"
          value="assigned"
        />
        <label for="assigned">Assigned</label>

        <input
          type="checkbox"
          v-model="filterForm.status"
          id="unassigned"
          name="status"
          value="unassigned"
        />
        <label for="unassigned">Unassigned</label>

        <input type="checkbox" v-model="filterForm.status" id="done" name="status" value="done" />
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

    <button class="apply-button" type="submit">Apply</button>
  </form>
</template>

<style scoped>
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

.apply-button {
  display: block;
  margin: 0 auto;
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
  text-align: center;
}

.apply-button:hover {
  background: #555555;
  transform: scale(1.05);
}

@media (min-width: 1024px) {
  .apply-button {
    grid-column: span 3; /* Make the "Add Task" button span all three columns */
    text-align: center;
  }
  .filter-form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    max-width: 50%;
    grid-column: span 3; /* Make the "Filter" button span all three columns */
    margin: 0 auto; /* Center the button */
  }
}
</style>
