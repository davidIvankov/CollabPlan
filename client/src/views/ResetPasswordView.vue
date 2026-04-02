<script setup lang="ts">
import { ref, computed } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { useRoute } from 'vue-router'
import { resetPassword } from '@/stores/user'
import NewPassword from '@/components/NewPassword.vue'

const route = useRoute()
const password = ref('')
const error = ref('')
const success = ref(false)
const token = computed(() => (route.query.token as string) || '')

async function submitResetPassword() {
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
        <NewPassword
          @error-change="(err) => (error = err)"
          name="password"
          v-model="password"
          id="password"
        ></NewPassword>
      </div>
      <p v-if="error" class="error">{{ error }}</p>

      <p v-if="success" class="success">Your password has been reset. You may now log in.</p>
      <button v-if="!success" :disabled="!!error" type="submit" class="btn">Reset Password</button>
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
