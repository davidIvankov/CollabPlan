<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { estimateTime } from '../stores/task'
import type { TaskInsertable, UserPrivate } from '@server/shared/types'
import type { AssistantMessageResponse } from 'cohere-ai/api'
import VueMarkdown from 'vue-markdown-render'
import { authUserId, getUser } from '@/stores/user'

// Add a type declaration for import.meta.vitest to avoid TS error
declare global {
  // Add vitest property to ImportMeta for type safety
  interface ImportMeta {
    vitest?: boolean
  }
  // Add __mockHandleEstimateAI to Window for type safety
  interface Window {
    __mockHandleEstimateAI?: () => Promise<void>
  }
}

if (import.meta.vitest) {
  window.__mockHandleEstimateAI = handleEstimateAI
}

const props = defineProps<{
  task: TaskInsertable
}>()
const emit = defineEmits(['closeAIChat'])
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const aiChat = ref<Array<{ role: 'assistant' | 'user'; content: string }>>([])
const userProposal = ref('')
const aiAwaitingProposal = ref(false)
const user = ref<UserPrivate>()

function closeAIChat() {
  aiChat.value = []
  aiAwaitingProposal.value = false
  aiError.value = null
  userProposal.value = ''
  emit('closeAIChat')
}

async function estimateTaskDurationAI(): Promise<AssistantMessageResponse> {
  return (
    await estimateTime({
      name: props.task.name,
      projectId: props.task.projectId,
      messages: aiChat.value,
    })
  ).message
}

async function handleEstimateAI() {
  aiLoading.value = true
  aiError.value = null
  aiChat.value = []
  userProposal.value = ''
  aiAwaitingProposal.value = false
  try {
    const aiResponse = await estimateTaskDurationAI()
    aiChat.value.push({
      role: 'assistant',
      content: aiResponse.content ? aiResponse.content[0].text : '',
    })
    aiAwaitingProposal.value = true
  } catch (e) {
    aiError.value = 'Failed to get AI suggestion.'
  } finally {
    aiLoading.value = false
  }
}

async function sendUserProposal() {
  const proposal = userProposal.value.trim()
  if (!proposal) return
  aiChat.value.push({ role: 'user', content: proposal })
  aiAwaitingProposal.value = false
  userProposal.value = ''
  aiLoading.value = true
  try {
    const aiResponse = await estimateTaskDurationAI()
    aiChat.value.push({
      role: 'assistant',
      content: aiResponse.content ? aiResponse.content[0].text : '',
    })
    aiAwaitingProposal.value = true
  } catch (e) {
    aiError.value = 'Failed to get AI suggestion.'
  } finally {
    aiLoading.value = false
  }
}

// MOCK: For demo, auto-run handleEstimateAI with mock data on mount
onMounted(async () => {
  user.value = await getUser(authUserId.value as string)
  // In test mode, mock handleEstimateAI with a dummy effect and delay
  if (import.meta.env.VITE_E2E) {
    // @ts-ignore
    window.__mockHandleEstimateAI = async function () {
      aiLoading.value = true
      aiError.value = null
      aiChat.value = []
      userProposal.value = ''
      aiAwaitingProposal.value = false
      await new Promise((resolve) => setTimeout(resolve, 300))
      aiChat.value.push({
        role: 'assistant',
        content: 'This is a mock AI response (test mode).',
      })
      aiAwaitingProposal.value = true
      aiLoading.value = false
    }
    window.__mockHandleEstimateAI()
  } else {
    handleEstimateAI()
  }
})
</script>
<template>
  <div v-if="aiChat.length > 0 || aiLoading || aiError" class="ai-chatbox">
    <div class="ai-chat-messages">
      <div v-for="(msg, i) in aiChat" :key="i" :class="['ai-chat-msg', msg.role]">
        <span v-if="msg.role === 'assistant'" class="ai-label">AI:</span>
        <span v-else class="user-label">{{ user?.name }}:</span>
        <span
          ><VueMarkdown :source="msg.content" data-testid="chat_message" class="markdown"
        /></span>
      </div>
      <div v-if="aiLoading" class="ai-chat-msg ai" data-testid="loading">
        <span class="ai-label">AI:</span>
        <span class="ai-loading-spinner">Thinking...</span>
      </div>
    </div>
    <div v-if="aiError" class="ai-error">{{ aiError }}</div>
    <div v-if="aiError" class="ai-actions">
      <button type="button" class="send-btn" @click="handleEstimateAI">Retry</button>
    </div>
    <div v-if="aiAwaitingProposal && !aiLoading && !aiError" class="ai-proposal-row">
      <input
        type="text"
        v-model="userProposal"
        placeholder="Type your message..."
        class="ai-proposal-input"
        @keydown.enter.stop.prevent="sendUserProposal"
      />
      <button type="button" class="send-btn" @click="sendUserProposal">Send</button>
    </div>
    <div class="ai-actions">
      <button type="button" class="close-btn" @click="closeAIChat">Dismiss</button>
    </div>
  </div>
</template>

<style scoped>
.ai-chatbox {
  margin-top: 12px;
  background: #f4f8fb;
  border-radius: 8px;
  color: black;
  padding: 12px 16px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px; /* Increased height for better visibility */
  justify-content: flex-start;
}
.ai-chat-messages {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.markdown {
  border-radius: 8px;
  color: var(--white);
  padding: 6px 8px;
  background-color: var(--grey-icon);
}
.ai-chat-msg {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.ai-chat-msg.ai .ai-label {
  color: #2980b9;
  font-weight: bold;
}
.ai-chat-msg.user .user-label {
  color: #555;
  font-weight: bold;
}
.ai-proposal-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}
.ai-proposal-input {
  width: 100%;
  border-radius: 4px;
  border: 1.5px solid #2980b9;
  padding: 10px 8px;
  box-sizing: border-box;
  background: #eaf3fb;
  color: #222;
  font-size: 1.08em;
  margin-bottom: 2px;
}
.send-btn {
  background: #2980b9;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 0;
  cursor: pointer;
  font-size: 0.95em;
  width: 100%;
}
.close-btn {
  background: #bbb;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 0.95em;
}
.ai-error {
  color: #c0392b;
  margin-top: 4px;
}
.ai-loading-spinner {
  font-style: italic;
  color: #2980b9;
  margin-left: 4px;
  animation: ai-blink 1.2s linear infinite;
}
@keyframes ai-blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}
</style>
