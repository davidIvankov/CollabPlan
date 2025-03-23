<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import VueMarkdown from 'vue-markdown-render'
import { getProjectById } from '@/stores/project'
import { getParticipantByProjectId } from '@/stores/participant'
import ListComponent from '@/components/ListComponent.vue'

const route = useRoute()
const project = ref(null)
const participants = ref()

onMounted(async () => {
  const projectId = route.params.id
  project.value = await getProjectById(projectId)
  participants.value = await getParticipantByProjectId(projectId)
  console.log(participants.value)
})
</script>
<template>
  <div class="project-details">
    <RouterLink :to="`/dashboard/projects/${route.params.id}/update`">
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
  </div>
</template>

<style scoped>
.description {
  overflow: auto;
}
.project-details {
  padding: 20px;
  max-width: 600px;
  margin: auto;
  margin-bottom: 5vw;
}

h1 {
  font-size: 24px;
  margin-top: 48px;
  color: var(--text-green);
}
</style>
