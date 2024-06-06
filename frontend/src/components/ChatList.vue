<!-- Holds a box that shows all "recent" chats -->
<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import ChatListItem from '@/components/ChatListItem.vue'
import { getToken } from '@/utils'
import axios from 'axios'

const chats = ref()

onMounted(() => {
  // Load all users from the server
  axios
    .get('http://localhost:3000/chat/listUsers',
	{ 
		headers: {
			Authorization: `Bearer ${getToken()}` 
		} 
	}).then((response) => {
      // TODO: Fetch the last message from the server for each chat
      chats.value = response.data
		.map((chat: { username: string, visibleName: string }) => ({
			username: chat.username,
			visibleName: chat.visibleName,
			lastMessage: 'No recent messages found.'
		}));
    }).catch((error) => {
      alert('Failed to load chat list')
      console.error(error)
    })
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
