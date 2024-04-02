<script setup lang="ts">
import ChatBox from './components/ChatBox.vue'


const msgs: [string, string][] = [
  ['Alice', 'Hello, Bob!'],
  ['Bob', 'Hi, Alice!'],
  ['Alice', 'How are you?'],
  ['Bob', 'I am good, thanks!'],
]

</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="https://upload.wikimedia.org/wikipedia/commons/c/c3/JKU_Logo.svg" width="150" />
    <h1>FullStack WebChat</h1>
    powered by shitty code
  </header>

  <main>
    <div class="wrapper">
      <ChatBox recipiant="Alice" :conversation="msgs" />
    </div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
