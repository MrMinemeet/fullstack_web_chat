<script setup lang="ts">
import ConversationItem from './ConversationItem.vue'
defineProps<{
	conversation: [string, string][] // Array of (string, string) tuples (but as an array)
}>()
</script>

<template>
	<ul class="conversation-list">
		<ConversationItem v-for="([sender, message], i) in conversation" :key="i" :sender="sender" :message="message" />
	</ul>
</template>