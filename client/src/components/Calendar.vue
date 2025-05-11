<script setup lang="ts">
import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import type { TaskSelectable, Slot } from '@server/shared/types'
import { dateForCalendar, formatForCalendar } from '@/utils/time'

const props = defineProps<{ tasks: TaskSelectable[] }>()

const events = props.tasks
  .filter((task) => task.assignedTo !== null)
  .map((task) => ({
    id: task?.id,
    title: task?.name,
    description: task?.description as string | undefined,
    start: formatForCalendar((task?.scheduledTime as Slot).start),
    end: formatForCalendar((task?.scheduledTime as Slot)?.end),
  }))
const calendarApp = createCalendar({
  selectedDate: dateForCalendar(new Date()).split(' ')[0],
  views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
  events: [...events],
})
</script>

<template>
  <div>
    <ScheduleXCalendar class="calendar" :calendar-app="calendarApp" />
  </div>
</template>
<style scoped>
.calendar {
  width: 100%;
  height: 70vh;
}
</style>
