<script setup lang="ts">
import ChatBox from '../components/ChatBox.vue'
import ChatList from '../components/ChatList.vue'

const msgs: [string, string][] = [
  ['Alice', 'Hello, Bob!'],
  ['Bob', 'Hi, Alice!'],
  ['Alice', 'How are you?'],
  ['Bob', 'I am good, thanks!']
]
</script>

<template>
  <div class="home-view">
    <ChatList class="border-right"/>
    <ChatBox recipiant="Alice" :conversation="msgs" /> 
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  gap: 10px;
  padding: 10px;
}
.border-right {
  border-right: 1px solid var(--color-border);
}
</style>