<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VueMarkdown from 'vue-markdown-render'
import { getProjectById } from '@/stores/project'
import { getParticipantByProjectId, removeParticipant } from '@/stores/participant'
import ListComponent from '@/components/ListComponent.vue'
import type { ProjectPublic } from '@server/shared/types'
import { authUserId } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const project: Ref<ProjectPublic | null> = ref(null)
const participants = ref()

const isOwner = computed(() => props.userId === project.value?.createdBy)
const props = defineProps<{ projectId: string; userId: string }>()

onMounted(async () => {
  project.value = await getProjectById(props.projectId)
  participants.value = await getParticipantByProjectId(props.projectId)
})

const leaveProject = async () => {
  if (!confirm('Are you shore you want to leave, your planning will be lost.')) return

  await removeParticipant({ userId: authUserId.value as string, projectId: props.projectId })

  router.push('/dashboard/profile')
}
</script>
<template>
  <div class="project-details">
    <RouterLink :to="`/dashboard/projects/${route.params.id}/update`" v-if="isOwner">
      <img src="@/assets/icons/settings.svg" alt="go back" class="svg" />
    </RouterLink>
    <button class="leave-btn" @click="leaveProject" v-else>Leave Project</button>

    <h1>{{ project?.name }}</h1>

    <VueMarkdown v-if="project?.description" :source="project.description" class="description" />
    <ListComponent
      v-if="participants"
      title="Participants"
      :projectId="projectId"
      :authUserId="authUserId"
      :listItems="participants"
      type="participant"
    ></ListComponent>
    <RouterLink
      v-if="isOwner"
      :to="`/dashboard/projects/${route.params.id}/add-participant`"
      class="btn"
      >+ Add Participant</RouterLink
    >
  </div>
</template>

<style scoped>
.description {
  overflow: auto;
}
.project-details {
  margin-top: 5vw;
  padding-bottom: 20vw;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.leave-btn {
  background-color: var(--button-danger);
  color: var(--white);
  padding: 10px 16px;
  font-size: var(--mobile-text);
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-width: 120px;
  text-align: center;
  border: none;
  width: 50%;
}
h1 {
  font-size: 24px;
  margin-top: 48px;
  color: var(--text-green);
}
</style>
