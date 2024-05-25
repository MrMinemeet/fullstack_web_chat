<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted } from 'vue';

const imgSrc = ref('');

const props = defineProps<{
	username: string
}>()

const getProfilePicture = (username: string): any => {
	// Request profile picture from the server (only url param needed)
	axios.get(`http://localhost:3000/profile/picture?username=${username}`)
	.then((response) => {
		// Get base64 img from response
		imgSrc.value = response.data;
	}).catch((error) => {
		imgSrc.value = 'http://127.0.0.1:3000/assets/unknown-person-icon.png';
	});
}

onMounted(async () => {
	getProfilePicture(props.username);
})
</script>

<template>
	<img class="userImage" :src="imgSrc" width="40" height="40"/>
</template>

<style scoped>
.userImage {
	border-radius: 50%;
}
</style>