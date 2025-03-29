<script setup lang="ts">
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { useRoute, useRouter } from 'vue-router'
import type { TaskInsertable } from '@server/shared/types'
import useErrorMessage from '@/composables/useErrorMessage'
import { createTask } from '@/stores/task'

const route = useRoute()
const router = useRouter()

const projectId = route.params.id
const task = ref<TaskInsertable>({
  name: '',
  description: '',
  duration: 1,
  projectId: projectId as string,
})

const [submitTask, errorMessage] = useErrorMessage(async () => {
  const taskNew = await createTask(task.value)
  console.log(taskNew)
  router.push(`/dashboard/projects/${projectId}/tasks`)
})
</script>

<template>
  <PageForm heading="New Task" formLabel="NewTask" @submit="submitTask">
    <template #default>
      <div class="inputs">
        <input
          aria-label="Name"
          placeholder="Task Name"
          type="text"
          v-model="task.name"
          :required="true"
        />
        <textarea
          aria-label="Description"
          v-model="task.description"
          placeholder="Enter task description..."
          rows="4"
          class="textarea"
          :required="true"
        ></textarea>
        <div class="duration">
          <label for="duration">Duration:</label>
          <div class="duration-input">
            <input
              type="number"
              aria-label="Duration"
              v-model="task.duration"
              min="1"
              id="duration"
              :required="true"
            />
            <p class="min">Minutes</p>
          </div>
        </div>
      </div>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <button type="submit" class="btn">Create</button>
    </template>
  </PageForm>
</template>

<style scoped>
.inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4vw;
  margin-bottom: 8vw;
}

.duration-input {
  margin-top: 12px;
  display: flex;
  background-color: var(--grey-icon);
  border-radius: 8px;
  padding-right: 12px;
}

.min {
  background-color: inherit;
}
.duration {
  width: 100%;
}

button {
  width: 100%;
  margin: auto;
  background-color: var(--button-blue);
  color: var(--white);
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: var(--mobile-text);
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}

.error {
  color: red;
  font-weight: bold;
}

textarea {
  resize: none;
}
</style>
