<!-- Holds a box that shows all "recent" chats -->
<script setup lang="ts">
import { ref } from 'vue';
import ChatListItem from './ChatListItem.vue';

const chats = ref([
  {
	name: 'Alice',
	lastMessage: 'Hello, Bob!'
  },
  {
	name: 'John',
	lastMessage: 'Awesome Job!'
  },
  {
	name: 'a',
	lastMessage: 'Awesome Job!'
  },
  {
	name: 'b',
	lastMessage: 'Awesome Job!'
  },
  {
	name: 'c',
	lastMessage: 'Awesome Job!'
  },
]);
</script>

<template>
  <div class="chat-list">
	<div class="chat-list-header">
	  <h2>Recent Chats</h2>
	</div>
	<div class="chat-list-entries">
	  <ChatListItem v-for="chat in chats" :key="chat.name" :name="chat.name" :lastMessage="chat.lastMessage" />
	</div>
  </div>
</template>

<style scoped>
.chat-list-entries {
	overflow-y: auto;
	max-height: 200px;
}
</style>