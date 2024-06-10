<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';

import {API_URL} from '@/constants';

const imgSrc = ref('');

const props = defineProps<{
	username: string
}>()

const getProfilePicture = (username: string): any => {
	// Request profile picture from the server (only url param needed)
	axios.get(`http://${API_URL}/profile/picture?username=${username}`)
	.then((response) => {
		// Get base64 img from response
		imgSrc.value = response.data;
	}).catch((error) => {
		// If even the default of a user cannot be loaded, then use the unknown person icon (typically for placeholder users that are not in the database)
		imgSrc.value = `http://${API_URL}/assets/unknown-person-icon.png`;
	});
}

onMounted(async () => {
	getProfilePicture(props.username);
})

watch(() => props.username, async (newVal) => {
	getProfilePicture(newVal);
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