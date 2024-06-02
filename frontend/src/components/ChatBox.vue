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

function attachFile() {
	console.debug("To be done");
	// TODO: Attach file to be sent with next message
}

</script>

<template>
	<div class="chatBox">
		<h2>Chatting with {{ recipiant }}</h2>
		<ConversationList :conversation="localConversations" />

		<div class="MsgInputFlexContainer">
			<textarea id="msgInputBox" class="MsgInputFlexItem" v-model="message" placeholder="Type a new message..."/>
			<img id="attachFile" class="MsgInputFlexItem clickable" src="../assets/paperclip.svg" @click="attachFile" alt="Attach File"/>
			<button id="sendMsgBtn" class="MsgInputFlexItem clickable" @click="sendMessage">Send</button>
		</div>
	</div>
	
	<button @click="console.log(localConversations)">Log Conversations</button>
</template>

<style scoped>
#msgInputBox {
	margin-top: 1rem;
	width: 30rem;
	height: 50px;
	resize: vertical;
}

.clickable {
	cursor: pointer;
}

.MsgInputFlexContainer {
	display: flex;
	flex: row;
	align-items: center;
	justify-content: center;
}

.MsgInputFlexItem {
	margin: 2.5px;
}

#attachFile {
	height: 25px;
	background-color: var(--color-text);
}
</style>