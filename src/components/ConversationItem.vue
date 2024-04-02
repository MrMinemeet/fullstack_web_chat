<script setup lang="ts">
defineProps<{
	sender: string
	message: string
}>()
</script>

<template>
	<div class="chatContainer">
		<img class="senderImage" src="https://uxwing.com/wp-content/themes/uxwing/download/emoji-emoticon/grinning-face-with-big-eyes-emoji-icon.svg" alt="Profile Picture" width="40"/>
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
.senderImage {
	border-radius: 50%;
	margin-right: 1rem;
}
</style>