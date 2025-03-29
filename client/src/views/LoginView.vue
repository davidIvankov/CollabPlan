<script lang="ts" setup>
import { login } from '@/stores/user'
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { useRouter } from 'vue-router'
import useErrorMessage from '@/composables/useErrorMessage'

const router = useRouter()

const userForm = ref({
  email: '',
  password: '',
})

const [submitLogin, errorMessage] = useErrorMessage(async () => {
  await login(userForm.value)

  router.push('/dashboard/profile')
})
</script>

<template>
  <PageForm heading="Login" formLabel="Login" @submit="submitLogin">
    <template #default>
      <div class="inputs">
        <input
          placeholder="example@email.com"
          type="email"
          autocomplete="username"
          v-model="userForm.email"
          :required="true"
        />

        <input
          placeholder="password"
          id="password"
          name="password"
          type="password"
          pattern="^.{8,}$"
          title="Password must be at least 8 characters long"
          autocomplete="current-password"
          v-model="userForm.password"
          :required="true"
        />
      </div>

      <p v-if="errorMessage" data-testid="errorMessage" type="danger">
        {{ errorMessage }}
      </p>

      <button type="submit" class="btn">Login</button>
    </template>

    <template #footer>
      <div class="footer">
        <p>Don't have an account?</p>
        <RouterLink to="/signup" class="signIn"> Signup </RouterLink>
      </div>
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
  width: var(100% - 10px);
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
