<script lang="ts" setup>
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { useRouter } from 'vue-router'
import useErrorMessage from '@/composables/useErrorMessage'
import { createProject } from '@/stores/project'

const router = useRouter()

const project = ref({
  name: '',
  description: '',
})

const [submitProject, errorMessage] = useErrorMessage(async () => {
  const newProject = await createProject(project.value)
  router.push(`/dashboard/projects/${newProject.id}`)
})
</script>

<template>
  <PageForm heading="New Project" formLabel="NewProject" @submit="submitProject">
    <template #default>
      <div class="inputs">
        <input
          placeholder="name"
          type="text"
          autocomplete="username"
          v-model="project.name"
          :required="true"
        />

        <textarea
          v-model="project.description"
          placeholder="Enter project description..."
          rows="5"
          class="textarea"
          :required="true"
        ></textarea>
      </div>

      <p v-if="errorMessage" data-testid="errorMessage" type="danger">
        {{ errorMessage }}
      </p>

      <button type="submit" class="btn">Create</button>
    </template>
  </PageForm>
</template>

<style scoped>
.inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4vw;
  margin-bottom: 8vw;
}
button {
  width: 100%;
  margin: auto;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: flex-end;
}
.footer p {
  color: var(--text-green);
  font-weight: 700;
}

.signIn {
  text-decoration: underline;
}
</style>
