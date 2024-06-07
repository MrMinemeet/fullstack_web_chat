<script setup lang="ts">
import ConversationItem from './ConversationItem.vue'
import type { Ref } from 'vue';

const props = defineProps<{
	conversation: Ref<{sender: string, content:string, fileName: string, fileId: number}[]>; // (Sender, Message)
}>()

</script>

<template>
	<ul class="conversation-list">
		<ConversationItem v-for="({sender, content, fileName, fileId}, i) in conversation" :key="i" :sender="sender" :message="content" :fileName="fileName" :fileId="fileId" />
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