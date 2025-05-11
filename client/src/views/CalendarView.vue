<script setup lang="ts">
import '@schedule-x/theme-default/dist/index.css'
import type { TaskSelectable } from '@server/shared/types'
import Calendar from '@/components/Calendar.vue'
import { ref } from 'vue'

const props = defineProps<{ tasks: TaskSelectable[] }>()
const tasksForDisplay = ref<TaskSelectable[]>(props.tasks)
</script>

<template>
  <Calendar :tasks="tasksForDisplay"></Calendar>
</template>
<style scoped></style>
