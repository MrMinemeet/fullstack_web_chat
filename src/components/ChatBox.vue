<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import ConversationList from './ConversationList.vue'

const props = defineProps<{
	recipiant: string
	conversation: [string, string][] // (Sender, Message)
}>()

let localConversations = reactive([ ...props.conversation ])

watchEffect(() => {
	// Replace all senders that are not the recipiant with "You"
	localConversations = localConversations.map(([sender, message]) => {
		return [sender === props.recipiant ? sender : 'You', message]
	})
})
</script>

<template>
	<div class="chatBox">
		<h2>Chatting with {{ recipiant }}</h2>
		<ConversationList :conversation="localConversations" />

		<textarea placeholder="Type a new message..." />
	</div>
</template>