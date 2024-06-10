<!-- Holds a box that shows all "recent" chats -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ChatListItem from '@/components/ChatListItem.vue'
import { getToken, getUsername } from '@/utils'
import axios from 'axios'
import { Socket } from 'socket.io-client';

const chats = ref()

const chatPartner = defineModel<string>()

const props = defineProps<{socket: Socket}>()

const user = getUsername()

props.socket.on('message', (msg: {sender: string; content: string; fileName: string; fileId: number;}) => {
  for(let chat of chats.value) {
    if(chat.username == msg.sender || user == msg.sender) {
      chat.lastMessage = msg.sender + ': ' + msg.content
    }
  }
})

onMounted(() => {
  // Load all users from the server
  axios.get('http://localhost:3000/chat/listUsers', { 
		headers: {
			Authorization: `Bearer ${getToken()}`,
      useCredentials: false 
		},
	}).then((response) => {
      // Get all users to chat with
      chats.value = response.data
        .filter((chat: { username: string }) => chat.username !== getUsername())
        .map((chat: { username: string, visibleName: string }) => ({
          username: chat.username,
          visibleName: chat.visibleName,
          lastMessage: 'No recent messages found.'
        }));
    }).then(() => {
      // Get last message for each chat
      for (const chat of chats.value) {
        axios.get(`http://localhost:3000/chat/getMsgs`,
          { 
            headers: {
              Authorization: `Bearer ${getToken()}` 
            },
            params: {
              username1: getUsername(),
              username2: chat.username,
              limit: 1
            }
          }).then((response) => {
            if (response.data.length === 0) return // No messages found (likely never chatted before)
            chat.lastMessage = response.data[0].sender + ': ' + response.data[0].message
          }).catch((error) => {
            console.error(error)
          })
      }
    }).catch((error) => {
      alert('Failed to load chat list')
      console.error(error)
    })
})

const handleChatClick = (username: string) => {
  console.log(`Clicked on chat with ${username}`)
  chatPartner.value = username
};

defineExpose({ 
  handleChatClick 
})
</script>

<template>
  <div class="chat-list">
    <div class="chat-list-header">
      <h2>Recent Chats</h2>
    </div>
    <div class="chat-list-entries">
      <ChatListItem
        v-for="chat in chats"
        :key="chat.username"
        :name="chat.username"
        :visibleName="chat.visibleName"
        :lastMessage="chat.lastMessage"
		    @chat-item-click="handleChatClick"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-list-entries {
  overflow-y: auto;
  max-height: 264px;
}
</style>
