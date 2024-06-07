<script setup lang="ts">
import { MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH } from '@/constants';
import axios from 'axios';
import { ref, defineEmits } from 'vue';

const username = ref('');
const email = ref('');
const password = ref('');

const emits = defineEmits();

const register = async () => {
	try {
		await axios.post('http://localhost:3000/auth/register', {
			username: username.value,
			email: email.value,
			password: password.value
		});
		console.info('Registered successfully');
		emits('auth-message', 'Registered successfully. Please log in to continue.');

	} catch (error: any) {
		emits('auth-message', error.response.data.message);
	}
}
</script>

<template>
	<div class="register">
		<h1>Register</h1>
		<form @submit.prevent="register">
			<input 
				type="text" 
				placeholder="Username" 
				required v-model="username" 
				:minlength="MIN_USERNAME_LENGTH" 
				:maxlength="MAX_USERNAME_LENGTH" 
			/>
			<input type="email" placeholder="Email" required v-model="email"/>
			<input type="password" placeholder="Password" required v-model="password" :minlength="MIN_PASSWORD_LENGTH" />
			<button :disabled="!username || username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH || !email || !password || password.length < MIN_PASSWORD_LENGTH">Register</button>
		</form>
	</div>
</template>

<style scoped>
	.register {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.register form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.register input {
		margin: 0.5rem;
		padding: 0.25rem 0.5rem;
	}

	.register input:valid {
		border-color: var(--valid-color);
	}

	.register input:invalid {
		border-color: var(--invalid-color);
	}

	.register button {
		margin: 0.5rem;
		padding: 0.25rem 0.5rem;
	}
</style>