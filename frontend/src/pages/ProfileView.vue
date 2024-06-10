<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import axios from 'axios';

	import defaultProfilePicture from '@/assets/Squidward_stock_art.webp';
	import { getUsername, getToken } from '@/utils';
	import { MIN_PASSWORD_LENGTH, API_URL, UNKNOWN_USERNAME } from '@/constants';

	const visibleUsername = ref(UNKNOWN_USERNAME);
	const profilePicture = ref(defaultProfilePicture);
	const oldUserName = ref(UNKNOWN_USERNAME);
	const fileInput = ref<HTMLInputElement>();
	const newPassword = ref('');
	const newConfirmPassword = ref('');

	const getVisibleName = (): void => {
		// Request visible name from the server (only url param needed)
		axios.get(`http://${API_URL}/profile/visibleName?username=${getUsername()}`)
		.then((response) => {
			visibleUsername.value = response.data.visibleName;
			oldUserName.value = response.data.visibleName;
		}).catch((error) => {
			console.warn(error.response.data.message);
		});
	}

	const getProfilePicture = (): void => {
		// Request profile picture from the server (only url param needed)
		axios.get(`http://${API_URL}/profile/picture?username=${getUsername()}`)
		.then((response) => {
			// Get base64 img from response
			profilePicture.value = response.data;
		}).catch((error) => {
			console.warn(error.response.data.message);
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
					const token = getToken();
					// Send the new profile picture to the server (authentication token in header)
					axios.put(`http://${API_URL}/profile/picture`, 
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
						console.warn(error.response.data.message);
					});					
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const changeVisibleName = (_: Event) => {
		const newVisibleUsername = visibleUsername.value;
		const token = getToken();
		axios.put(`http://${API_URL}/profile/visibleName`, 
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
			console.warn(error.response.data.message);
		});
	};

	const changePassword = (_: Event) => {
		const newPasswordValue = newPassword.value;
		const token = getToken();
		axios.post(`http://${API_URL}/auth/changePassword`, 
		{ 
			// Body
			password: newPasswordValue
		},
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((response) => {
			console.info('Password updated successfully');
			// Remove "traces" and clean up just a bit
			newPassword.value = '';
			newConfirmPassword.value = '';
		}).catch((error) => {
			// TODO: Print a user-friendly error message in UI
			console.warn(error.response.data.message);
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
		getProfilePicture();
	});
</script>
<template>
  <div class="profile">
	<img :src="profilePicture" @click="onPictureClick" class="profile-picture margin" />
    <input id="fileIn" type="file" ref="fileInput" @change="onFileChange" class="button margin" style="display: none" />

	<input v-model="visibleUsername" placeholder="Visible Username" class="usernameInput margin" />
	<button v-if="oldUserName !== visibleUsername" @click="changeVisibleName" class="button margin">Update</button>

	<form class="changePwForm" @submit.prevent="changePassword">
		<input type="password" v-model="newPassword" placeholder="New Password" class="newPasswordInput margin" :minlength="MIN_PASSWORD_LENGTH" />
		<input type="password" v-model="newConfirmPassword" v-if="newPassword" placeholder="Confirm new Password" class="newPasswordInput margin" :minlength="MIN_PASSWORD_LENGTH" />

		<button v-if="newPassword && newPassword === newConfirmPassword" class="changePwButton margin">Change Password</button>
		<div class="pwConfirmNotMatching margin" v-else-if="newPassword">
			Confirmation does not match new password!
		</div>
	</form>

	<button @click="logout" class="margin">Logout</button>
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

.margin {
  margin: 5px;
}

.profile-picture {
  width: 240px;
  height: 240px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 50%;
  background-color: lightblue;
  margin-bottom: 10px;
}

.profile-picture:hover {
  opacity: 0.6;
  filter: blur(2px);
}

.usernameInput,
.newPasswordInput,
changePwButton {
  width: 200px;
}

.pwConfirmNotMatching {
	color: var(--invalid-color);
}

.changePwForm {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.changePwForm input:invalid {
	border-color: var(--invalid-color);
}
</style>