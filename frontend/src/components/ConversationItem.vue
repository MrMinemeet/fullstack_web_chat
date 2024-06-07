<script setup lang="ts">
import UserPicture from './UserPicture.vue'
import { getUsername } from '../utils'

const props = defineProps<{
	sender: string
	message: string
	fileName: string
	fileId: number
}>()

let senderName = props.sender
if (props.sender === 'You') {
	senderName = getUsername()
}
</script>

<template>
	<div class="chatContainer">
		<UserPicture class="senderImg" :username="senderName"/>
		
		<div class="chat-entry">
			<h3 class="senderName">{{ sender }}:</h3>
			<em class="message">{{ message }}</em>
			<p v-if="fileName">
				<a :href="'http://localhost:3000/file/download?fileId=' + fileId">{{ fileName }}</a>
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