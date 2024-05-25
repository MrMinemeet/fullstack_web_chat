<script setup lang="ts">
import { ref } from 'vue';
import UserPicture from './components/UserPicture.vue';
import { getUsername } from './utils';

const authenticatedUser = ref(getUsername());
</script>

<template>
  <header class="header">
    <img
      alt="Vue logo"
      class="logo"
      src="https://upload.wikimedia.org/wikipedia/commons/c/c3/JKU_Logo.svg"
      width="150"
    />
    <div class="title">
      <h1>FullStack WebChat</h1>
      powered by shitty code
    </div>
    <nav class="navigation">
      <RouterLink to="/">Go to Home 🏠</RouterLink>
      
      <RouterLink to="/profile"><UserPicture :username="authenticatedUser"/></RouterLink> <!-- TODO: Get Avatar from DB using the name of the authenticated user -->
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  color: --color-text;
  background-color: #1a4446;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  padding: 10px;
}
.navigation {
  padding: 10px;
  display: flex;
  gap: 10px;
}
</style>
