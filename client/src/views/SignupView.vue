<script lang="ts" setup>
import PageForm from '@/components/PageForm.vue'
import PasswordField from '@/components/PasswordField.vue'
import { signupInputSchema } from '@server/shared/schemas'
import { ref, watchEffect } from 'vue'
import { DEFAULT_SERVER_ERROR } from '@/consts'
import { login, signup } from '@/stores/user'
import { useRouter } from 'vue-router'

const disableSubmit = ref(false)
const router = useRouter()
const confirmPassword = ref('')
const userForm = ref({
  name: '',
  email: '',
  password: '',
})
const errorMessage = ref('')

watchEffect(() => {
  const parsed = signupInputSchema.safeParse(userForm.value)
  if (!parsed.success) {
    errorMessage.value = parsed.error.issues[0]?.message ?? 'Invalid input'
    disableSubmit.value = true
    return
  }
  if (userForm.value.password !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    disableSubmit.value = true
  } else {
    errorMessage.value = ''
    disableSubmit.value = false
  }
})
const hasSucceeded = ref(false)

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
        <PasswordField
          data-testid="password"
          placeholder="password"
          id="password"
          name="password"
          autocomplete="new-password"
          pattern="^.{8,}$"
          title="Password must be at least 8 characters long"
          v-model="userForm.password"
          :required="true"
        />
        <PasswordField
          data-testid="confirmPassword"
          placeholder="confirm password"
          id="confirm-password"
          name="confirm-password"
          autocomplete="new-password"
          title="Must match password"
          :required="true"
          v-model="confirmPassword"
        />
      </div>

      <p v-if="errorMessage" data-testid="errorMessage" type="danger">
        {{ errorMessage }}
      </p>
      <p v-if="hasSucceeded">jup</p>

      <button type="submit" class="btn" :disabled="disableSubmit">Signup</button>
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
.input > * {
  width: 100%;
}
button {
  width: var(100% - 10px);
  margin: auto;
}

button:disabled {
  background-color: var(--white-disabled);
  color: var(--grey-disabled);
  cursor: not-allowed;
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
