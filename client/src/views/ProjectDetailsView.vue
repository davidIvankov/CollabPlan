<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import VueMarkdown from 'vue-markdown-render'
import { getProjectById } from '@/stores/project'

const route = useRoute()
const project = ref(null)

onMounted(async () => {
  const projectId = route.params.id
  project.value = await getProjectById(projectId)
})
</script>
<template>
  <div class="project-details">
    <button @click="$router.go(-1)">
      <img src="@/assets/icons/arrow-left.svg" alt="go back" class="svg" />
    </button>

    <h1>{{ project?.name }}</h1>

    <VueMarkdown v-if="project?.description" :source="project.description" class="description" />

    <h2>Collaborators</h2>
  </div>
</template>

<style scoped>
.project-details {
  padding: 20px;
  max-width: 600px;
  margin: auto;
}

h1 {
  font-size: 24px;
  margin-top: 48px;
  color: var(--text-green);
}
</style>
