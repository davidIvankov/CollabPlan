<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import VueMarkdown from 'vue-markdown-render'
import { getProjectById } from '@/stores/project'
import { getParticipantByProjectId } from '@/stores/participant'
import ListComponent from '@/components/ListComponent.vue'
import type { ProjectPublic } from '@server/shared/types'

const route = useRoute()
const project: Ref<ProjectPublic | null> = ref(null)
const participants = ref()

const isOwner = computed(() => props.userId === project.value?.createdBy)
const props = defineProps<{ projectId: string; userId: string }>()

onMounted(async () => {
  project.value = await getProjectById(props.projectId)
  participants.value = await getParticipantByProjectId(props.projectId)
})
</script>
<template>
  <div class="project-details">
    <RouterLink :to="`/dashboard/projects/${route.params.id}/update`" v-if="isOwner">
      <img src="@/assets/icons/settings.svg" alt="go back" class="svg" />
    </RouterLink>

    <h1>{{ project?.name }}</h1>

    <VueMarkdown v-if="project?.description" :source="project.description" class="description" />
    <ListComponent
      v-if="participants"
      title="Participants"
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

h1 {
  font-size: 24px;
  margin-top: 48px;
  color: var(--text-green);
}
</style>
