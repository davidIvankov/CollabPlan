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

const localListItems = ref<ParticipantSelected[] | ProjectByParticipant[] | ProjectPublic[] | null>(
  null
)

onMounted(async () => {
  if (props.projectId) {
    project.value = await getProjectById(props.projectId)
  }
  localListItems.value = props.listItems
})

const isDeletable = (userId: string) => {
  return project.value?.createdBy === authUserId.value && authUserId.value !== userId
}

const remove = async (userId: string, name: string) => {
  if (!confirm(`Delete participant ${name}!`)) return
  await removeParticipant({ projectId: props.projectId as string, userId: userId })
  localListItems.value = (localListItems.value as ParticipantSelected[]).filter(
    (item: ParticipantSelected) => item.userId !== userId
  )
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
          <span class="avatar">{{ getInitials(item.name) }}</span>
          <div>
            <h3>{{ item.name }}</h3>
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
  flex-wrap: wrap;
  justify-content: space-between;
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
}

.participant,
.participant * {
  background-color: #3498db;
  color: white;
}
ul {
  width: 50%;
  margin: 0;
  padding-left: 2vw;
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

.participant-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
}

.avatar {
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 50%;
  background-color: var(--text-green);
  color: var(--background-grey);
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  display: inline-block;
}

.item-link {
  width: 100%;
  height: 100%;
  padding: 15px;
}
</style>
