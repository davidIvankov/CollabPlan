<script setup>
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
const getInitials = (name) => {
  return name ? name.substring(0, 2).toUpperCase() : '??'
}
</script>
<template>
  <div class="item-list">
    <h1>{{ title }}</h1>

    <ul>
      <li v-for="item in listItems" :key="item.id" class="list-item">
        <!-- 1. Basic Project (No Role) -->
        <router-link
          v-if="type === 'project-basic'"
          :to="`/dashboard/projects/${item.id}`"
          class="item-link"
        >
          <h3>{{ item.name }}</h3>
        </router-link>

        <!-- 2. Project with Role -->
        <router-link
          v-else-if="type === 'project-with-role'"
          :to="`/dashboard/projects/${item.id}`"
          class="item-link"
        >
          <h3>{{ item.name }}</h3>
          <p class="role">
            Role: <strong>{{ item.role }}</strong>
          </p>
        </router-link>

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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: white;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.list-item {
  background-color: #2c3e50;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
}

.list-item:hover {
  background-color: #34495e;
}

.item-link {
  color: white;
  text-decoration: none;
  display: block;
  width: 100%;
}

.item-link h3,
.participant-item h3 {
  font-size: 20px;
  margin: 0;
}

.item-link p,
.participant-item p {
  color: #bdc3c7;
}

.role {
  font-size: 14px;
  color: #f1c40f;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  display: inline-block;
}
</style>
