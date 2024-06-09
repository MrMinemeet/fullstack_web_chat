<script setup lang="ts">
import ConversationItem from './ConversationItem.vue'
import { reactive, ref } from 'vue'

const props = defineProps<{
	conversation: {sender: string, content:string}[] // (Sender, Message)
}>()

</script>

<template>
	<ul class="conversation-list">
		<ConversationItem v-for="({sender, content}, i) in conversation" :key="i" :sender="sender" :message="content" />
	</ul>
</template>

<style scoped>
.conversation-list {
	list-style-type: none;
	max-height: 200px;
	overflow-y: scroll;
	padding-left: 10px;
}
</style>