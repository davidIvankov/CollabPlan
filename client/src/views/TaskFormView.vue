<script setup lang="ts">
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import AiChat from '@/components/AiChat.vue'
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

const aiChatOpen = ref(false)

const [submitTask, errorMessage] = useErrorMessage(async () => {
  const taskNew = await createTask(task.value)
  console.log(taskNew)
  router.push(`/dashboard/projects/${projectId}/tasks`)
})

function openAiChat() {
  aiChatOpen.value = true
}
function closeAiChat() {
  aiChatOpen.value = false
}
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
            <button
              type="button"
              class="ai-btn"
              @click="openAiChat"
              data-testid="open_chat_button"
              v-if="!aiChatOpen && task.description && task.name"
            >
              Estimate with AI
            </button>
          </div>
          <AiChat v-if="aiChatOpen" @closeAIChat="closeAiChat" :task="task" />
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
  width: var(100% - 10px);
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

.ai-duration-estimate {
  margin-top: 16px;
  text-align: center;
}

.ai-btn {
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 12px;
  background: var(--button-blue);
  color: var(--white);
  border: none;
  border-radius: 5px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.95em;
}
.ai-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
