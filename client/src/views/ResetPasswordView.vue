<script setup lang="ts">
import { ref, computed } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { useRoute } from 'vue-router'
import { resetPassword } from '@/stores/user'

const route = useRoute()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)

const token = computed(() => (route.query.token as string) || '')

async function submitResetPassword() {
  error.value = ''
  success.value = false
  if (!password.value || password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  if (!token.value) {
    error.value = 'Invalid or missing reset token.'
    return
  }

  try {
    const { completed } = await resetPassword({ token: token.value, password: password.value })
    success.value = completed
  } catch (e) {
    if (e instanceof Error) error.value = e.message
  }
}
</script>

<template>
  <PageForm heading="Reset Password" formLabel="ResetPassword" @submit="submitResetPassword">
    <template #default>
      <div class="inputs">
        <input
          type="password"
          v-model="password"
          placeholder="New password"
          autocomplete="new-password"
          required
        />
        <input
          type="password"
          v-model="confirmPassword"
          placeholder="Confirm new password"
          autocomplete="new-password"
          required
        />
      </div>
      <p v-if="error" class="error">{{ error }}</p>

      <p v-if="success" class="success">Your password has been reset. You may now log in.</p>
      <button v-if="!success" type="submit" class="btn">Reset Password</button>
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
.error {
  color: #c0392b;
  margin-bottom: 8px;
}
.success {
  color: #27ae60;
  margin-bottom: 8px;
}
</style>
