<script setup lang="ts">
import UserPicture from './UserPicture.vue'
import { defineProps, defineEmits, onMounted } from 'vue'
const props = defineProps<{
	name: string
	visibleName: string
	lastMessage: string
}>()

const emit = defineEmits()

const handleClick = () => {
	emit('chat-item-click', props.name);
}
</script>

<template>
	<div class="chat-list-entry" @click="handleClick">
		<UserPicture :username="name" />
		<div class="chat-info">
			<h3>{{ visibleName }}:</h3>
			<p>{{ lastMessage }}</p>
		</div>
  	</div>
</template>

<style scoped>
.chat-list-entry {
	display: flex;
	width: 100%;
	gap: 10px;
	padding: 10px;
	margin-right: 50px;
	transition: background-color 0.3s ease;
}
.chat-list-entry:hover {
	background-color: var(--color-border-hover);
	cursor: pointer;
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