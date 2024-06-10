<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import axios from 'axios'

import UserPicture from '@/components/UserPicture.vue'
import { getUsername, getToken } from '@/utils'

const route = useRoute()
const username = ref(getUsername());
axios.defaults.withCredentials  = false;

// Update UserPicture element in header by somewhat abusing the key prop. As the name doesn't change, a redraw is forced by changing the key.
const userPictureKey = ref(0);
watch(route, () => {
  userPictureKey.value++;
})
</script>

<template>
  <header class="header">
    <div class="logo">
      Created at
      <a href="https://www.jku.at">
        <img
          alt="Johnannes Kepler University Linz Logo"
          src="https://upload.wikimedia.org/wikipedia/commons/c/c3/JKU_Logo.svg"
          width="150"
        />
      </a>
    </div>
    <div class="title">
      <RouterLink to="/">
        <h1>FullStack WebChat</h1>
      </RouterLink>
      powered by shitty code
    </div>
    <nav class="navigation">
      <RouterLink to="/" v-if="route.fullPath !== '/'">Go to Home 🏠</RouterLink>
      <RouterLink to="/profile" v-if="getToken()">
        <UserPicture :username="username" :key="userPictureKey" />
      </RouterLink>
      <RouterLink to="/auth" v-else-if="route.fullPath !== '/auth'">Login/Register</RouterLink>
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
