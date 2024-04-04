<script setup lang="ts">
import ChatBox from '../components/ChatBox.vue'

const msgs: [string, string][] = [
  ['Alice', 'Hello, Bob!'],
  ['Bob', 'Hi, Alice!'],
  ['Alice', 'How are you?'],
  ['Bob', 'I am good, thanks!']
]
</script>

<template>
  <main>
    <div class="wrapper">
      <ChatBox recipiant="Alice" :conversation="msgs" />
    </div>
  </main>
</template>