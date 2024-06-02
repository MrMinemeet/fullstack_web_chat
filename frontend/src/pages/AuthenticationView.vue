<script lang="ts">
import axios from 'axios';

export default {
	name: 'AuthenticationView',
	data() {
		return {
			alert: '',
			username: '',
			email: '',
			password: ''
		}
	},
	methods: {
		async register() {
			this.alert = "";
			try {
				const response = await axios.post('http://localhost:3000/auth/register', {
					username: this.username,
					email: this.email,
					password: this.password
				});
				console.info('Registered successfully');
				this.alert = 'Registered successfully. Please log in to continue.';

			} catch (error: any) {
				this.alert = error.response.data.message;
			}
		},
		async login() {
			this.alert = "";
			try {
				const response = await axios.post('http://localhost:3000/auth/login', {
					username: this.username,
					password: this.password
				});
				let expires = new Date(response.data.expiresAt);
				document.cookie = `token=${response.data.token}; expires=${expires}; path=/; SameSite=Strict`; // In reality, "Secure" should be added to the cookie options
				console.info(`Logged in successfully. Session will expire in ${expires}`);

				// Redirect to home
				this.$router.push('/');

			} catch (error: any) {
				console.warn(error);
				this.alert = error.response.data.message;
			}			
		}
	}
}
</script>


<template>
	<div id="alert" v-if="alert">{{ alert }}</div>

	<div class="authForm">
		<div class="login">
			<h1>Login</h1>
			<form @submit.prevent="login">
				<input type="text" placeholder="Username" autocomplete="on" required v-model="username" minlength="2" maxlength="255"/>
				<input type="password" placeholder="Password" required v-model="password" minlength="2"/>
				<button>Login</button>
			</form>
		</div>
		<div class="register">
			<!-- Register -->
			<h1>Register</h1>
			<form @submit.prevent="register">
				<input type="text" placeholder="Username" requried v-model="username" minlength="2" maxlength="255"/>
				<input type="email" placeholder="Email" required v-model="email"/>
				<input type="password" placeholder="Password" required v-model="password" minlength="2"/>
				<button>Register</button>
			</form>
		</div>
	</div>
</template>

<style scoped>
	.authForm {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.login, .register {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
	}
	.login form, .register form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.login input, .register input {
		margin: 0.5rem;
		padding: 0.25rem 0.5rem;
	}
	.login input:valid, .register input:valid {
		border-color: var(--valid-color);
	}
	.login input:invalid, .register input:invalid {
		border-color: var(--invalid-color);
	}
	.login button, .register button {
		margin: 0.5rem;
		padding: 0.25rem 0.5rem;
	}
</style>