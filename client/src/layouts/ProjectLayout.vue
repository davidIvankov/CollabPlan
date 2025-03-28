<script setup lang="ts">
import ProjectNavigation from '@/components/ProjectNavigation.vue'
import { authUserId } from '@/stores/user'
import { useRoute } from 'vue-router'

const route = useRoute()
const projectId = route.params.id
</script>

<template>
  <ProjectNavigation :projectId="projectId as string"></ProjectNavigation>
  <RouterView :projectId="projectId" :userId="authUserId"></RouterView>
</template>
<style scoped></style>
