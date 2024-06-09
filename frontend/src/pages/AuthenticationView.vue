<script setup lang="ts">
import { ref } from 'vue';
import LoginBox from '@/components/LoginBox.vue';
import RegisterBox from '@/components/RegistrationBox.vue';

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