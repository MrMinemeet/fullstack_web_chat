<script setup lang="ts">
import ChatBox from '../components/ChatBox.vue'
import ChatList from '../components/ChatList.vue'

const msgs: {sender: string, content:string}[] = [
  {sender:'Alice', content:'Hello, Bob!'},
  {sender:'Bob', content:'Hi, Alice!'},
   {sender:'Alice', content:'How are you?'},
  {sender:'Bob', content:'I am good, thanks!'}
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