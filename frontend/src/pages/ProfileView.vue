<script setup lang="ts">
	import { ref } from 'vue';

	import defaultProfilePicture from '../assets/Squidward_stock_art.webp';
	const profilePicture = ref(defaultProfilePicture);
	const username = ref('Squidward Tentacles');
	const statusMessage = ref('Annoyed by SpongeBob SquarePants.');
	const fileInput = ref<HTMLInputElement>();
	
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
					// Send the new profile picture to the server
					fetch('http://localhost:3000/profile/uploadPicture', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
						body: JSON.stringify({
							username: "alex", // TODO: Do this properly
							pictureB64: imageB64,
						}),
					}).then((response) => {
						console.log(response);
					}).catch((error) => {
						console.error(error);
					});
					

					
					profilePicture.value = imageB64;
				}

			};
			reader.readAsDataURL(file);
		}
	};
</script>
<template>
	<p>This page will show the profile of the user when logged in. It allows chaning the profile picture and maybe some other things.</p>
	If not authenticated, it should redirect to <RouterLink to="/auth">Authentication</RouterLink>
  <div class="profile">
	<img :src="profilePicture" @click="onPictureClick" class="profile-picture" />
    <input v-model="username" placeholder="Username" class="username-input" />
    <textarea v-model="statusMessage" placeholder="Status message" class="status-input"></textarea>
    <input id="fileIn" type="file" ref="fileInput" @change="onFileChange" style="display: none" />
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