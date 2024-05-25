<script setup lang="ts">
import UserPicture from './UserPicture.vue'
import { ref } from 'vue'
import { getUsername } from '../utils'

const props = defineProps<{
	sender: string
	message: string
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