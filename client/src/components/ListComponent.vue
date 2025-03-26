<script setup>
import { RouterLink } from 'vue-router'
import { getInitials } from '@/utils/getInitials'

defineProps({
  title: {
    type: String,
    default: 'List',
  },
  listItems: {
    type: Array,
    required: true,
  },
  type: {
    type: String,
    required: true, // "project-basic", "project-with-role", "participant"
  },
})

// Compute initials for participant avatars
</script>
<template>
  <div class="item-list">
    <h1>{{ title }}</h1>

    <ul>
      <li :class="type" v-for="item in listItems" :key="item.id" class="list-item">
        <!-- 1. Basic Project (No Role) -->
        <RouterLink
          v-if="type === 'project-basic'"
          :to="`/dashboard/projects/${item.id}/details`"
          class="item-link"
        >
          <h3>{{ item.name }}</h3>
        </RouterLink>

        <!-- 2. Project with Role -->
        <RouterLink
          v-else-if="type === 'project-with-role'"
          :to="`/dashboard/projects/${item.id}/details`"
          class="item-link"
        >
          <h3>{{ item.name }}</h3>
          <p class="role">
            Role: <strong>{{ item.role }}</strong>
          </p>
        </RouterLink>

        <!-- 3. Participant -->
        <div v-else-if="type === 'participant'" class="participant-item">
          <span class="avatar">{{ getInitials(item.name) }}</span>
          <div>
            <h3>{{ item.name }}</h3>
            <p class="role">
              Role: <strong>{{ item.role }}</strong>
            </p>
          </div>
        </div>

        <slot v-else :item="item"></slot>
        <!-- Custom Slot for Other Types -->
      </li>
    </ul>

    <p v-if="listItems.length === 0">No items available.</p>
  </div>
</template>

<style scoped>
.item-list {
  width: 100%;
  margin: 0 auto;
  color: white;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.project-basic,
.project-with-role,
.project-with-role *,
.project-basic * {
  background-color: #f4f4f4;
  color: #333;
}

h1 {
  font-size: 20px;
  margin-bottom: 20px;
}

.participant,
.participant * {
  background-color: #3498db;
  color: white;
}
.list-item {
  overflow: hidden;
  margin: 10px 0;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
}

.item-link h3,
.participant-item h3 {
  font-size: 20px;
  margin: 0;
}

.role {
  font-size: 14px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
}

.avatar {
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 50%;
  background-color: var(--text-green);
  color: var(--background-grey);
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  display: inline-block;
}

.item-link {
  width: 100%;
  height: 100%;
  padding: 15px;
}
</style>
