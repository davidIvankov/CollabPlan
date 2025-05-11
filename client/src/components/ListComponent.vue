<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getInitials } from '@/utils/getInitials'
import type { ParticipantSelected, ProjectByParticipant, ProjectPublic } from '@server/shared/types'
import { authUserId } from '@/stores/user'
import { onMounted, ref } from 'vue'
import { getProjectById } from '@/stores/project'
import { removeParticipant } from '@/stores/participant'

const project = ref<ProjectPublic | null>(null)
const props = defineProps<{
  title: string
  projectId?: string
  listItems: ParticipantSelected[] | ProjectByParticipant[] | ProjectPublic[]
  type: 'project-basic' | 'project-with-role' | 'participant'
}>()

type ExtendedParticipant = ParticipantSelected & { showDetails: boolean }

const localListItems = ref<ExtendedParticipant[] | ProjectByParticipant[] | ProjectPublic[] | null>(
  null
)

function isParticipantList(items: any[]): items is ParticipantSelected[] {
  return props.type === 'participant'
}

onMounted(async () => {
  if (props.projectId) {
    project.value = await getProjectById(props.projectId)
  }
  if (isParticipantList(props.listItems))
    localListItems.value = props.listItems.map((item) => ({ ...item, showDetails: false }))
  else localListItems.value = props.listItems
})

const isDeletable = (userId: string) => {
  return project.value?.createdBy === authUserId.value && authUserId.value !== userId
}

const remove = async (userId: string, name: string) => {
  if (!confirm(`Delete participant ${name}!`)) return
  await removeParticipant({ projectId: props.projectId as string, userId: userId })
  localListItems.value = (localListItems.value as ExtendedParticipant[]).filter(
    (item: ParticipantSelected) => item.userId !== userId
  )
}

const toggleDetails = (item: any) => {
  item.showDetails = !item.showDetails
}
</script>
<template>
  <div class="item-list">
    <h1>{{ title }}</h1>

    <ul>
      <li
        :class="type"
        v-for="item in localListItems"
        :key="(item as ProjectPublic).id"
        class="list-item"
      >
        <RouterLink
          v-if="type === 'project-basic'"
          :to="`/dashboard/projects/${(item as ProjectPublic).id}/details`"
          class="item-link"
        >
          <h3>{{ item.name }}</h3>
        </RouterLink>

        <RouterLink
          v-else-if="type === 'project-with-role'"
          :to="`/dashboard/projects/${(item as ProjectByParticipant).id}/details`"
          class="item-link"
        >
          <h3>{{ item.name }}</h3>
          <p class="role">
            Role: <strong>{{ (item as ParticipantSelected).role }}</strong>
          </p>
        </RouterLink>

        <div v-else-if="type === 'participant'" class="participant-item">
          <div class="top-row" @click="toggleDetails(item)">
            <span class="avatar">{{ getInitials(item.name) }}</span>
            <h3>{{ item.name }}</h3>
          </div>
          <div v-if="(item as ExtendedParticipant).showDetails" class="bottom-row">
            <p class="email">
              Email: <strong>{{ (item as ParticipantSelected).email }}</strong>
            </p>
            <p class="role">
              Role: <strong>{{ (item as ParticipantSelected).role }}</strong>
            </p>
            <button
              v-if="isDeletable((item as ParticipantSelected).userId)"
              @click="remove((item as ParticipantSelected).userId, item.name)"
              class="delete-btn"
            >
              Remove
            </button>
          </div>
        </div>

        <slot v-else :item="item"></slot>
        <!-- Custom Slot for Other Types -->
      </li>
    </ul>

    <p v-if="listItems.length === 0">No items available.</p>
  </div>
</template>

<style scoped>
.item-list {
  width: 100%;
  color: white;
  margin: 2vw;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  background: var(--background-grey);
}

.delete-btn {
  background-color: var(--button-danger) !important;
  color: var(--white);
  padding: 10px 16px;
  font-size: var(--mobile-text);
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
}

.project-basic,
.project-with-role,
.project-with-role *,
.project-basic * {
  background-color: #f4f4f4;
  color: #333;
}

h1 {
  font-size: 20px;
  margin-bottom: 20px;
  align-self: center;
}

.participant,
.participant * {
  background-color: #3498db;
  color: white;
}
ul {
  width: 100%;
  margin: 0;
  padding: 0; /* Removed padding-left */
}
.list-item {
  overflow: hidden;
  margin: 10px 0;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
}

.item-link h3,
.participant-item h3 {
  font-size: 20px;
  margin: 0;
}

.role {
  font-size: 14px;
}

.avatar {
  width: 50px;
  height: 50px;
  line-height: 50px;
  border-radius: 50%;
  background-color: var(--text-green);
  color: var(--background-grey);
  font-weight: bold;
  font-size: 20px;
  text-align: center;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.participant-item {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 10px;
  background-color: #3498db;
  box-shadow: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  width: 100%;
}

.participant-item:hover {
  transform: none;
  box-shadow: none;
}

.top-row {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px 10px 0 0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.bottom-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #2c3e50; /* Darker color for better contrast */
  color: white; /* Text color to ensure visibility */
  padding: 10px;
  overflow: hidden; /* Prevent content from overflowing the border radius */
}

.email,
.role,
.email *,
.role * {
  background-color: inherit;
}

.participant-item h3 {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.participant-item .email,
.participant-item .role {
  font-size: 14px;
  color: inherit; /* Match text color to the container's color */
  margin: 5px 0;
}

.delete-btn {
  background-color: var(--button-danger);
  color: var(--white);
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: #e74c3c;
}

.item-link {
  width: 100%;
  height: 100%;
  padding: 15px;
}

li {
  list-style: none;
}
</style>
