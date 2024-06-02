<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import ConversationList from './ConversationList.vue'
import { ref } from 'vue'


const props = defineProps<{
	recipiant: string
	conversation: {sender: string, content:string}[] // (Sender, Message)
}>()

let localConversations = props.conversation

watchEffect(() => {
	// Replace all senders that are not the recipiant with "You"
	localConversations = localConversations.map(convo => {
		if (convo.sender !== props.recipiant) {
			convo.sender = 'You'
		}
		return convo
	})
})

const message = ref('')

function sendMessage() {
	localConversations = [...localConversations, {sender:'You', content: message.value}];
	message.value = ''
}

</script>

<template>
	<div class="chatBox">
		<h2>Chatting with {{ recipiant }}</h2>
		<ConversationList :conversation="localConversations" />

		<textarea id="messageArea" v-model="message" placeholder="Type a new message..."/>
		<button id="sendMsgBtn" @click="sendMessage">Send</button>
	</div>

	<button @click="console.log(localConversations)">Log Conversations</button>
</template>

<style scoped>
#messageArea {
	margin-top: 1rem;
	width: 30rem;
	height: 50px;
	resize: none;
}
</style>