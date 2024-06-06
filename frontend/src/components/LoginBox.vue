<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue';
import router from '@/router'

const username = ref('');
const password = ref('');

const emits = defineEmits();

const login = async () => {
	try {
		const response = await axios.post('http://localhost:3000/auth/login', {
			username: username,
			password: password
		});
		let expires = new Date(response.data.expiresAt);
		document.cookie = `token=${response.data.token}; expires=${expires}; path=/; SameSite=Strict`; // In reality, "Secure" should be added to the cookie options
		console.info(`Logged in successfully. Session will expire in ${expires}`);

		// Redirect to home
		router.push('/');

	} catch (error: any) {
		console.warn(error);
		emits(error.response.data.message);
	}	
}
</script>

<template>
	<div class="login">
		<h1>Login</h1>
		<form @submit.prevent="login">
			<input type="text" placeholder="Username" autocomplete="on" required v-model="username" minlength="2" maxlength="255"/>
			<input type="password" placeholder="Password" required v-model="password" />
			<button>Login</button>
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