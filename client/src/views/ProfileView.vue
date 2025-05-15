<script lang="ts" setup>
import { authUserId, getUser } from '@/stores/user'
import { onMounted, ref, computed, type Ref } from 'vue'
import ListComponent from '@/components/ListComponent.vue'
import type { UserPrivate } from '@server/shared/types'
import {
  usersProjects,
  participatingIn,
  updateParticipatingIn,
  updateUsersProjects,
} from '@/stores/project'

const user: Ref<UserPrivate | undefined> = ref()

onMounted(async () => {
  await updateUsersProjects(authUserId.value as string)
  await updateParticipatingIn(authUserId.value as string)
  user.value = await getUser()
})

const userInitials = computed(() => {
  return user.value?.name ? user.value.name.substring(0, 2).toUpperCase() : ''
})
</script>
<template>
  <div class="profile" v-if="user">
    <div class="user-icon">
      {{ userInitials }}
    </div>

    <h2 class="user-name">{{ user.name }}</h2>
    <p class="user-email">{{ user.email }}</p>

    <div class="projects">
      <div class="lists-container">
        <!-- First list -->
        <div class="list">
          <ListComponent
            v-if="usersProjects"
            title="My Projects"
            :listItems="usersProjects"
            type="project-basic"
          ></ListComponent>
        </div>

        <!-- Second list -->
        <div class="list">
          <ListComponent
            v-if="participatingIn"
            title="Collaborating in"
            :listItems="participatingIn"
            type="project-with-role"
          ></ListComponent>
        </div>
      </div>

      <RouterLink to="/dashboard/projects/new" class="add-project-btn btn"
        >+ Add Project</RouterLink
      >
    </div>
  </div>
</template>

<style scoped>
.add-project-btn {
  display: block;
  background-color: var(--button-blue);
  color: var(--white);
  text-align: center;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}

.list {
  display: flex;
  align-items: flex-start;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.profile {
  padding: 16px;
  text-align: center;
  margin-bottom: 10vw;
  max-width: 400px;
  color: var(--white);
  margin: 0 auto; /* Center horizontally */
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
  justify-content: center; /* Center content vertically */
  height: 100vh; /* Full viewport height for centering */
}

.user-icon {
  width: 60px;
  height: 60px;
  line-height: 60px;
  border-radius: 50%;
  background-color: var(--text-green); /* Soft teal for contrast */
  color: var(--background-grey); /* Dark text for visibility */
  font-weight: bold;
  font-size: 22px;
  text-align: center;
  display: inline-block;
  margin-bottom: 10px;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  margin: 5px 0;
}

.user-email {
  font-size: 14px;
  color: #bbb; /* Lighter text for readability */
}

.projects {
  text-align: left;
  margin-top: 20px;
  width: 100%;
  padding: 0; /* Ensure no extra padding */
}

.lists-container {
  display: flex;
  flex-direction: column; /* Default for smaller screens */
  gap: 20px;
}

.list {
  flex: 1;
  display: flex;
}

h3 {
  font-size: 18px;
  color: #ddd; /* Softer than white for better contrast */
  margin-bottom: 8px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #333; /* Darker gray for contrast */
  margin: 4px 0;
  padding: 10px;
  border-radius: 8px;
  font-size: 16px;
  color: #fff; /* White text */
  border: 1px solid #444; /* Subtle border */
}

li:hover {
  background: #444;
}

/* Media query for tablets (768px to 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .profile {
    padding: 24px;
    max-width: 600px;
  }

  .user-icon {
    width: 80px;
    height: 80px;
    line-height: 80px;
    font-size: 28px;
  }

  .user-name {
    font-size: 24px;
  }

  .user-email {
    font-size: 16px;
  }
}

/* Media query for desktop screens (min-width: 1025px) */
@media (min-width: 1025px) {
  .profile {
    padding: 32px;
    max-width: 800px;
  }

  .user-icon {
    width: 100px;
    height: 100px;
    line-height: 100px;
    font-size: 32px;
  }

  .user-name {
    font-size: 28px;
  }

  .user-email {
    font-size: 18px;
  }

  .lists-container {
    display: grid; /* Use CSS Grid for layout */
    grid-template-columns: repeat(2, 1fr); /* Create three equal columns */
    margin-top: 32px; /* Add more spacing on top for desktop */
    width: 100%;
  }

  .list {
    flex: 1;
    width: 100%; /* Allow lists to adjust dynamically */
    height: 100%;
  }
}
</style>
