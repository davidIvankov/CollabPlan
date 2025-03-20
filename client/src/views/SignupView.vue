<script lang="ts" setup>
import PageForm from '@/components/PageForm.vue'
import { ref } from 'vue'
import { DEFAULT_SERVER_ERROR } from '@/consts'
import { login, signup } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()

const userForm = ref({
  name: '',
  email: '',
  password: '',
})

const hasSucceeded = ref(false)

// Wrap our signup call in a try/catch block to catch any errors.
// Set the error message if there is an error.
const errorMessage = ref('')
async function submitSignup() {
  try {
    await signup(userForm.value)

    const { email, password } = userForm.value
    await login({ email, password })

    router.push('/dashboard/profile')
    // clear error
    errorMessage.value = ''
  } catch (error) {
    // set error, which will be automatically displayed
    errorMessage.value = error instanceof Error ? error.message : DEFAULT_SERVER_ERROR
  }
}
</script>

<template>
  <PageForm heading="Registration" formLabel="Signup" @submit="submitSignup">
    <template #default>
      <div class="inputs">
        <input
          data-testid="name"
          placeholder="name"
          type="text"
          v-model="userForm.name"
          autocomplete="name"
          :required="true"
        />
        <input
          data-testid="email"
          placeholder="example@email.com"
          label="Email"
          type="email"
          autocomplete="email"
          v-model="userForm.email"
          :required="true"
        />
        <input
          data-testid="password"
          placeholder="password"
          label="Password"
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          pattern="^.{8,}$"
          title="Password must be at least 8 characters long"
          v-model="userForm.password"
          :required="true"
        />
      </div>

      <p v-if="errorMessage" data-testid="errorMessage" type="danger">
        {{ errorMessage }}
      </p>
      <p v-if="hasSucceeded">jup</p>

      <button type="submit" class="btn">Signup</button>
    </template>

    <template #footer>
      <div class="footer">
        <p>Already member?</p>
        <RouterLink to="/login" class="login"> Login </RouterLink>
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
  font-weight: 700;
  color: var(--text-green);
}

.login {
  text-decoration: underline;
}
</style>
