<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'

import router from '@/router'
import { MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, API_URL } from '@/constants';

const username = ref('')
const password = ref('')

const emits = defineEmits()

const login = async () => {
  try {
    const response = await axios.post(`http://${API_URL}/auth/login`, {
      username: username.value,
      password: password.value
    })
    let expires = new Date(response.data.expiresAt)
    document.cookie = `token=${response.data.token}; expires=${expires}; path=/; SameSite=Strict` // In reality, "Secure" should be added to the cookie options
    console.info(`Logged in successfully. Session will expire in ${expires}`)
	  emits('auth-message', 'Login successful. Redirecting to home page.')
    // Redirect to home
    router.push('/')
  } catch (error: any) {
    console.warn(error.toString())
    emits('auth-message', error.response?.data?.message || error.message)
  }
}
</script>

<template>
	<div class="login">
		<h1>Login</h1>
		<form @submit.prevent="login">
			<input
				type="text"
				placeholder="Username"
				autocomplete="on"
				required
				v-model="username"
				:minlength="MIN_USERNAME_LENGTH"
				:maxlength="MAX_USERNAME_LENGTH"
			/>
			<input type="password" placeholder="Password" required v-model="password" :minlength="MIN_PASSWORD_LENGTH"/>
			<button :disabled="!username || username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH || !password || password.length < MIN_PASSWORD_LENGTH">Login</button>
		</form>
	</div>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login input {
  margin: 0.5rem;
  padding: 0.25rem 0.5rem;
}

.login input:valid {
  border-color: var(--valid-color);
}

.login input:invalid {
  border-color: var(--invalid-color);
}

.login button {
  margin: 0.5rem;
  padding: 0.25rem 0.5rem;
}
</style>
