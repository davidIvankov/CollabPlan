<script setup lang="ts">
import ProjectNavigation from '@/components/ProjectNavigation.vue'
import { getTasks } from '@/stores/task'
import { authUserId } from '@/stores/user'
import type { TaskSelectable } from '@server/shared/types'
import { onMounted, ref } from 'vue'
import { useRoute, RouterView } from 'vue-router'

const route = useRoute()
const projectId = route.params.id
const tasks = ref<TaskSelectable[] | null>()

onMounted(async () => {
  tasks.value = await getTasks(projectId as string)
})

const reloadTasks = async () => {
  tasks.value = await getTasks(projectId as string)
}
</script>

<template>
  <div class="container">
    <ProjectNavigation :projectId="projectId as string"></ProjectNavigation>
    <RouterView
      class="routerView"
      :projectId="projectId"
      v-if="tasks"
      :tasks="tasks"
      :userId="authUserId"
      @task-updated="reloadTasks"
    ></RouterView>

    <RouterLink
      class="button"
      :to="`/dashboard/projects/${projectId}/calendar`"
      active-class="invisible"
    >
      <img src="@/assets/icons/calendar.svg" alt="Calendar" class="calendarIcon" />
    </RouterLink>
  </div>
</template>
<style scoped>
.calendarIcon {
  background-color: var(--grey-icon);
  padding: 12px;
  width: 24px;
  height: 24px;
}

.invisible {
  display: none;
}

.invisible * {
  display: none;
}

.button {
  border-radius: 50%;
  overflow: hidden;
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: calc(84px + 3vw);
  right: 24px;
}

@media (min-width: 768px) {
  .button {
    top: 80px; /* Position at the top */
    left: 24px; /* Position at the left */
    bottom: auto; /* Reset bottom positioning */
    right: auto; /* Reset right positioning */
  }
}

@media (min-width: 1025px) {
  .container {
    padding-left: 90px;
  }
  .button {
    top: 24px; /* Position at the top */
    left: 224px; /* Position at the left */
    bottom: auto; /* Reset bottom positioning */
    right: auto; /* Reset right positioning */
  }
  .RouterView .formContainer {
    padding: 0;
  }
}
</style>
