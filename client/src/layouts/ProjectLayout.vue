<script setup lang="ts">
import ProjectNavigation from '@/components/ProjectNavigation.vue'
import { getProjectById } from '@/stores/project'
import { getUser } from '@/stores/user'
import type { ProjectPublic, UserPublic } from '@server/shared/types'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const user = ref<UserPublic | null>(null)
const route = useRoute()
const projectId = route.params.id

onMounted(async () => {
  user.value = await getUser()
})
</script>

<template>
  <ProjectNavigation :projectId="projectId as string"></ProjectNavigation>
  <RouterView :projectId="projectId" :userId="user?.id"></RouterView>
</template>
<style scoped></style>
