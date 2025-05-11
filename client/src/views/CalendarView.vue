<script setup lang="ts">
import '@schedule-x/theme-default/dist/index.css'
import type { ParticipantSelected, TaskSelectable } from '@server/shared/types'
import Calendar from '@/components/Calendar.vue'
import { onMounted, ref } from 'vue'
import FilterParticipanForm from '@/components/FilterParticipanForm.vue'
import { getParticipantByProjectId } from '@/stores/participant'

const props = defineProps<{ tasks: TaskSelectable[]; projectId: string }>()
const participants = ref<ParticipantSelected[]>()

const calendarKey = ref(0)

const reloadCalendar = () => {
  calendarKey.value += 1
}

const onFilter = (participantIds: string[]) => {
  tasksForDisplay.value = props.tasks
    .filter((task) => task.assignedTo)
    .filter((task) => participantIds.includes(task.assignedTo as string))

  reloadCalendar()
  console.log(tasksForDisplay.value)
}

onMounted(async () => {
  participants.value = await getParticipantByProjectId(props.projectId)
})
const tasksForDisplay = ref<TaskSelectable[]>(props.tasks)
</script>

<template>
  <FilterParticipanForm
    :participants="participants!"
    @filter="onFilter"
    v-if="participants"
  ></FilterParticipanForm>
  <Calendar :tasks="tasksForDisplay" :key="calendarKey"></Calendar>
</template>
<style scoped></style>
