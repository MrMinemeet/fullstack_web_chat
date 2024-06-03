<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import ConversationList from './ConversationList.vue'
import { MAX_FILE_SIZE } from '@/constants';
import { ref } from 'vue'


const props = defineProps<{
	recipiant: string
	conversation: {sender: string, content:string}[] // (Sender, Message)
}>()

let localConversations = props.conversation;
const message = ref('');
const file = ref<File | null>(null);

watchEffect(() => {
	// Replace all senders that are not the recipiant with "You"
	localConversations = localConversations.map(convo => {
		if (convo.sender !== props.recipiant) {
			convo.sender = 'You'
		}
		return convo
	})
})

function sendMessage() {
	localConversations = [...localConversations, {sender:'You', content: message.value}];
	message.value = ''
}

// Attaches the selected file if the file is valid and smaller than MAX_FILE_SIZE
function attachFileHandler(event: Event) {
	const selectedFile = (event.target as HTMLInputElement).files?.[0];
	if (!selectedFile) {
		console.warn("No file selected (selection was null)");
		alert("Something went wrong when selecting the file. Please try again.")
		file.value = null;
		return;
	}
	
	if (selectedFile.size > MAX_FILE_SIZE) {
		console.warn(`'${selectedFile.name}' is too large (${selectedFile.size} bytes). Maximum size is ${MAX_FILE_SIZE} bytes.`);
		alert("The selected file is too large. Please select a file smaller than 10MiB.")
		file.value = null;
		return;
	}

	console.info(`Attached file: ${selectedFile.name} (${selectedFile.size} bytes)`);
	file.value = selectedFile;
}

// Triggers the file selector when the user clicks the attachment icon. This is a workaround in order to not show the "input" element to the user.
function openFileSelector() {
	let fileInput =	document.getElementById('fileInput');
	if (fileInput) {
		fileInput.click();
	}
}

// Remove the attached file when the user clicks the remove button
function removeAttachedFile() {
	file.value = null;
}

</script>

<template>
	<div class="chatBox">
		<h2>Chatting with {{ recipiant }}</h2>
		<ConversationList :conversation="localConversations" />

		<div class="MsgInputFlexContainer">
			<textarea id="msgInputBox" class="MsgInputFlexItem" v-model="message" placeholder="Type a new message..."/>
			<div id="attachFile" class="MsgInputFlexItem clickable" @click="openFileSelector"></div>
			<input id="fileInput" type="file" @change="attachFileHandler" style="display: none" :multiple="false" />
			<button id="sendMsgBtn" class="MsgInputFlexItem clickable" @click="sendMessage">Send</button>
		</div>
		<div v-if="file">
			Attached File: <em>{{ file.name }}</em>
			<span class="attachmentRemove clickable" @click="removeAttachedFile"> ⓧ</span>
		</div>
	</div>
	
	<button @click="console.log(localConversations)">Log Conversations</button>
</template>

<style scoped>
#fileTypeImage {
	height: 25px;
	width: 25px;
	padding: 5px;
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
	border-radius: 5px;
}

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
	width: 25px;
	padding: 5px;
	background-image: url('../assets/paperclip.svg');
	background-color: #FFFFFF;
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
	border-radius: 5px;
}

/*
#attachFile:hover {
	height: 25px;
	padding: 5px;
	background-color: var(--color-background-mute);
	border-radius: 5px;
}
*/

.attachmentRemove {
	color: var(--color-heading);
}

</style>