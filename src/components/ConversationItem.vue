<script setup lang="ts">
import UserPicture from './UserPicture.vue'
defineProps<{
	sender: string
	message: string
}>()
</script>

<template>
	<div class="chatContainer">
		<UserPicture class="senderImg" imgSrc="https://uxwing.com/wp-content/themes/uxwing/download/emoji-emoticon/grinning-face-with-big-eyes-emoji-icon.svg"/>
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