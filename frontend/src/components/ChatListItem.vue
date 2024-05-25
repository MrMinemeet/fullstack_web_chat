<script setup lang="ts">
import UserPicture from './UserPicture.vue'
const props = defineProps<{
	name: string
	lastMessage: string
}>()
</script>

<template>
	<div class="chat-list-entry"> <!-- TODO: Load chat when clicked --> 
		<UserPicture :username="name" />
		<div class="chat-info">
			<h3>{{ name }}:</h3>
			<p>{{ lastMessage }}</p>
		</div>
  	</div>
</template>

<style scoped>
.chat-list-entry {
	display: flex;
	gap: 10px;
	padding: 10px;
	margin-right: 50px;
}
.chat-info {
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.chat-info p {
	min-width: 100px;
}
</style>