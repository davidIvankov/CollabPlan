<script setup lang="ts">
import type { ParticipantSelected } from '@server/shared/types'
import { defineProps, defineEmits, ref } from 'vue'

const props = defineProps<{
  participants: ParticipantSelected[] // Array of participants
}>()

const formValue = ref<string[]>(props.participants.map((participant) => participant.userId))

const emit = defineEmits(['filter'])

const onSubmit = (): void => {
  emit('filter', formValue.value)
}
</script>

<template>
  <form class="checkbox-group" @submit.prevent="onSubmit">
    <h3 class="form-title">Filter by participants</h3>
    <div v-for="participant in participants" :key="participant.userId">
      <input
        type="checkbox"
        :id="participant.userId"
        :value="participant.userId"
        v-model="formValue"
      />
      <label :for="participant.userId">{{ participant.name }}</label>
    </div>
    <button class="apply-button" type="submit">Apply</button>
  </form>
</template>

<style scoped>
.checkbox-group {
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
  transform: translateX(5px); /* Slightly move to the right on hover */
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

.form-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 16px;
}

@media (min-width: 1024px) {
  .checkbox-group {
    width: 33%; /* One third of the screen width */
    margin: 0 auto; /* Center the form */
  }
}
</style>
