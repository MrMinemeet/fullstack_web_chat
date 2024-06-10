<script setup lang="ts">
import { ref } from 'vue'
import { Socket } from 'socket.io-client'

import { uploadFile } from '@/utils';
import { MAX_FILE_SIZE, NOT_SELECTED } from '@/constants';
import ConversationList from '@/components/ConversationList.vue'

const props = defineProps<{
	socket: Socket
	user: string
	recipiant: string
	//conversation: { sender: string; content: string; fileName: string; fileId: number; }[] // (Sender, Message)
}>()

const conversation = defineModel<{ sender: string; content: string; fileName: string; fileId: number; }[]>()
const message = ref('')
const file = ref<File | null>(null)


async function sendMessage() {
	// Don't send empty messages. Only allow either a message or a emtpy message with a file
	if (!(message.value.trim()) && !file.value) {
		console.warn('No message to send')
		return
	}

	// Upload the file if selected
	let fileId = -1;
	let fileName = "";
	if (file.value) {
		fileId = await uploadFile(file.value);
		fileName = file.value.name;
	}

	props.socket.emit('message', { sender: props.user, receiver: props.recipiant, content: message.value, fileName: fileName, fileId: fileId })
	const newMsg : { sender: string, content:string, fileName: string, fileId: number }  = {sender:'You', content: message.value, fileName: fileName, fileId: fileId}

	if (!conversation.value) 
		conversation.value = []
	conversation.value.push(newMsg);
	message.value = ''
	file.value = null
}


// Attaches the selected file if the file is valid and smaller than MAX_FILE_SIZE
function attachFileHandler(event: Event) {
	const selectedFile = (event.target as HTMLInputElement).files?.[0]
	if (!selectedFile) {
		console.warn('No file selected (selection was null)')
		alert('Something went wrong when selecting the file. Please try again.')
		file.value = null
		return
	}
	if (selectedFile.size > MAX_FILE_SIZE) {
		console.warn(
			`'${selectedFile.name}' is too large (${selectedFile.size} bytes). Maximum size is ${MAX_FILE_SIZE} bytes.`
		)
		alert('The selected file is too large. Please select a file smaller than 10MiB.')
		file.value = null
		return
	}

	console.info(`Attached file: ${selectedFile.name} (${selectedFile.size} bytes)`)
	file.value = selectedFile
}

// Triggers the file selector when the user clicks the attachment icon. This is a workaround in order to not show the "input" element to the user.
function openFileSelector() {
	let fileInput = document.getElementById('fileInput')
	if (fileInput) {
		fileInput.click()
	}
}

// Remove the attached file when the user clicks the remove button
function removeAttachedFile() {
	file.value = null
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
	// Prevent "normal" behavior of creating a new line, and instead send the message
	event.preventDefault()
	sendMessage()
  }
}

</script>

<template>
	<div v-if="recipiant === NOT_SELECTED" >
		<em>No chat selected</em>
	</div>
	<div v-else class="chatBox">
		<h2>Chatting with {{ recipiant }}</h2>
		<ConversationList v-model="conversation" />
		<div>
			<form @submit.prevent="sendMessage" class="MsgInputFlexContainer">
				<textarea
				id="msgInputBox"
				class="MsgInputFlexItem"
				v-model="message"
				placeholder="Type a new message..."
				@keydown="handleKeyDown"
				/>
				<div id="attachFile" class="MsgInputFlexItem clickable" @click="openFileSelector"></div>
				<input
				id="fileInput"
				type="file"
				@change="attachFileHandler"
				style="display: none"
				:multiple="false"
				/>
				<button id="sendMsgBtn" class="MsgInputFlexItem clickable">Send</button>
			</form>
		</div>
		<div v-if="file">
			Attached File:
			<em v-if="file.name.length > 20">{{ `${file.name.substring(0, 20)}…` }}</em>
			<em v-else>{{ file.name }}</em>
			<span class="attachmentRemove clickable" @click="removeAttachedFile"> ⓧ</span>
		</div>
	</div>
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
  background-color: #ffffff;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 5px;
}

.attachmentRemove {
  color: var(--color-heading);
}
</style>
