<script setup lang="ts">
import { ref } from 'vue';
import LoginBox from '@/components/LoginBox.vue';
import RegisterBox from '@/components/RegistrationBox.vue';

export default {
	name: 'AuthenticationView',
	data() {
		return {
			MIN_PASSWORD_LENGTH: MIN_PASSWORD_LENGTH,
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
				const response = await axios({
					method: 'post',
					url: 'http://localhost:3000/auth/register',
					data: {
						username: this.username,
						email: this.email,
						password: this.password
					},
					withCredentials: false
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
				const response = await axios({
					method: 'post',
					url: 'http://localhost:3000/auth/login',
					data: {
						username: this.username,
						password: this.password
					},
					withCredentials: false
				});
				let expires = new Date(response.data.expiresAt);
				document.cookie = `token=${response.data.token}; expires=${expires}; path=/; SameSite=Strict`; // In reality, "Secure" should be added to the cookie options
				console.info(`Logged in successfully. Session will expire in ${expires}`);
const alert = ref<string | null>(null);

let currentView = ref('login');

const register = () => { currentView.value = 'register'}
const login = () => { currentView.value = 'login'}

const handleAuthError = (message: string) => {
	alert.value = `${message}`;
}

defineExpose({ 
	handleAuthError
});

</script>


<template>
	<div id="alert" v-if="alert">{{ alert }}</div>
	<div class="AuthBox">
		<div class="innerBox" v-if="currentView === 'login'">
			<LoginBox @auth-message="handleAuthError"/>
			Your first time here? <span class="fake-link" @click="register()">Register</span>
		</div>
		<div class="innerBox" v-if="currentView === 'register'">
		<RegisterBox @auth-message="handleAuthError" />
			Already have an account? <span class="fake-link" @click="login()">Login</span>
		</div>
	</div>
</template>

<style scoped>
	.AuthBox {
		height: 20rem;
		width: 20rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-self: start;
		background-color: var(--color-background-mute);
		border-radius: 5px;
		border-color: var(--color-border);
	}

	.innerBox {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>