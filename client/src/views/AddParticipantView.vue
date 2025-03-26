<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { getInitials } from '@/utils/getInitials'
import { search } from '@/stores/user'
import { createParticipant, getParticipantByProjectId } from '@/stores/participant'
import { useRoute, useRouter } from 'vue-router'
import type { ProjectParticipantPublic, UserPublic } from '@server/shared/types'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const users = ref()
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const participants = ref()

const projectId = route.params.id as string
const noParticipants = computed(() => {
  if (!participants.value || !users.value) return []
  const participantsIds = participants.value.map(
    (participant: ProjectParticipantPublic) => participant.userId
  )
  return users.value.filter((user: UserPublic) => {
    return !participantsIds.includes(user.id)
  })
})

onMounted(async () => {
  participants.value = await getParticipantByProjectId(projectId)
})

const addParticipant = async (userId: string) => {
  await createParticipant({ userId, projectId })

  router.push(`/dashboard/projects/${projectId}/details`)
}

const handleSearch = async () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(async () => {
    users.value = await search(searchQuery.value)
  }, 300)
}
</script>
<template>
  <div class="search-container">
    <h1 class="title">Add Participant</h1>
    <input
      @input="handleSearch"
      v-model="searchQuery"
      type="text"
      class="search-input"
      placeholder="Search by name..."
    />

    <div class="participant-list">
      <div v-for="user in noParticipants" :key="user?.id" class="participant">
        <div class="avatar">{{ getInitials(user?.name) }}</div>
        <div class="data">
          <p class="name">{{ user?.name }}</p>
          <p class="email">{{ user?.email }}</p>
        </div>
        <button class="add-btn" @click="addParticipant(user?.id)">Add</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.data {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: inherit;
  overflow: hidden;
}

.data p {
  background-color: inherit;
  margin: 0;
}
.search-container {
  width: 90%;
  max-width: 400px;
  text-align: center;
  margin: auto;
  padding-top: 20px;
}

.title {
  font-size: var(--mobile-title);
  margin-bottom: 20px;
  color: var(--white);
}

.search-input {
  width: 100%;
  padding: 10px;
  font-size: var(--mobile-text);
  border: none;
  border-radius: 8px;
  background-color: var(--grey-icon);
  color: var(--white);
  outline: none;
}

.participant-list {
  margin-top: 20px;
}

.participant {
  gap: 2vw;
  display: flex;
  align-items: center;
  background: var(--grey-icon);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  width: 100%;
}

.avatar {
  width: 40px;
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--button-blue);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: var(--mobile-text);
  margin-right: 10px;
}

.add-btn {
  background-color: var(--button-blue);
  color: var(--white);
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.invite-btn:hover {
  background-color: #217dbb;
}
</style>
