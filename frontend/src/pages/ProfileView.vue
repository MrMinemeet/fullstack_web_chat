<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import axios from 'axios';
	import defaultProfilePicture from '../assets/Squidward_stock_art.webp';

	const UNKNOWN_USERNAME = '!unknown!';

	const visibleUsername = ref(UNKNOWN_USERNAME);
	const profilePicture = ref(defaultProfilePicture);
	const oldUserName = ref(UNKNOWN_USERNAME);
	const statusMessage = ref('Annoyed by SpongeBob SquarePants.');
	const fileInput = ref<HTMLInputElement>();

	const getUsername = (): string => {
		const token = document.cookie.split(";").find((c) => c.startsWith("token="))?.split("=")[1];
		if(!token)
			return UNKNOWN_USERNAME
		try {
			return JSON.parse(atob(token.split('.')[1])).username;
		} catch (e) {
			return UNKNOWN_USERNAME
		}
	}

	const getVisibleName = (): void => {
		// Request visible name from the server (only url param needed)
		axios.get(`http://localhost:3000/profile/visibleName?username=${getUsername()}`)
		.then((response) => {
			visibleUsername.value = response.data.visibleName;
			oldUserName.value = response.data.visibleName;
		}).catch((error) => {
			console.warn(error);
		});
	}

	
	const onPictureClick = () => {
		fileInput.value?.click();
	};

	const onFileChange = (event : Event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (pe) => {
				// Update the profile picture with the new image
				if (pe.target && pe.target.result) {
					const imageB64 = pe.target.result.toString();
					// FIXM:E The imaage is not properly encoded and causes API to crash
					console.log(imageB64);
					const token = document.cookie.split(";").find((c) => c.startsWith("token="))?.split("=")[1];
					// Send the new profile picture to the server (authentication token in header)
					axios.put('http://localhost:3000/profile/picture', 
					{ 
						// Body
						image: imageB64 
					}, 
					{
						headers: {
							Authorization: `Bearer ${token}`
						}
					}).then((response) => {
						console.info('Profile picture updated successfully');
						profilePicture.value = imageB64;
					}).catch((error) => {
						console.warn(error);
					});					
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const changeVisibleName = (_: Event) => {
		const newVisibleUsername = visibleUsername.value;
		const token = document.cookie.split(";").find((c) => c.startsWith("token="))?.split("=")[1];
		axios.put('http://localhost:3000/profile/visibleName', 
		{ 
			// Body
			visibleName: newVisibleUsername
		}, 
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((response) => {
			console.info('Visible username updated successfully');
			oldUserName.value = newVisibleUsername;
		}).catch((error) => {
			console.warn(error);
		});
	};

	const logout = () => {
		// remove the "token" cookie by settign the expiration date to the past
		document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

		// redirect to the login page
		window.location.href = '/auth';
	}

	onMounted(() => {
		getVisibleName();
	});
</script>
<template>
  <div class="profile">
	<img :src="profilePicture" @click="onPictureClick" class="profile-picture" />
	<input v-model="visibleUsername" placeholder="Visible Username" class="username-input" />
	<button v-if="oldUserName !== visibleUsername" @click="changeVisibleName" class="button">Update</button>
    <textarea v-model="statusMessage" placeholder="Status message" class="status-input"></textarea>
    <input id="fileIn" type="file" ref="fileInput" @change="onFileChange" class="button" style="display: none" />
	<button @click="logout">Logout</button>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1 px lightgray solid;
  padding: 5px;
}

.profile-picture {
  width: 240px;
  height: 240px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 50%;
  background-color: lightblue;
}

.profile-picture:hover {
  opacity: 0.6;
  filter: blur(2px);
}

.username-input,
.status-input {
  margin-top: 20px;
  width: 400px;
}
</style>