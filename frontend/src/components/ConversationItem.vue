<script setup lang="ts">
import UserPicture from './UserPicture.vue'
import { getUsername, deleteFile } from '../utils'
import { onMounted, ref } from 'vue';

const props = defineProps<{
	sender: string
	message: string
	fileName: string
	fileId: number
}>()

const senderNameVisible = ref(props.sender);
const senderNameActual = ref(props.sender);
if (senderNameVisible.value === 'You') {
	senderNameActual.value = getUsername()
} else if (senderNameVisible.value === getUsername()) {
	senderNameVisible.value = 'You'
}

const delFile = async () => {
	try {
		await deleteFile(props.fileId)
	} catch (error: any) {
		alert(error);
		console.warn(error)
	}
}
</script>

<template>
	<div class="chatContainer">
		<UserPicture class="senderImg" :username="senderNameActual"/>
		
		<div class="chat-entry">
			<h3 class="senderName">{{ senderNameVisible }}:</h3>
			<em class="message">{{ message }}</em>
			<p v-if="fileName">
				<a :href="'http://localhost:3000/file/download?fileId=' + fileId">{{ fileName }}</a>
				<span v-if="senderNameActual === getUsername()" @click="delFile">⦻</span>
			</p>
		</div>
	</div>
</template>

<style scoped>
.chatContainer {
	display: flex;
}
.senderImg {
	margin-right: 1rem;
}
</style>