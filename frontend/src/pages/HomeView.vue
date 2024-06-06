<script setup lang="ts">
import { getToken } from '../utils';
import ChatBox from '../components/ChatBox.vue'
import ChatList from '../components/ChatList.vue'
import { io } from "socket.io-client";
import {ref } from 'vue'

const msgs: {sender: string, content:string}[] = [
  {sender:'Alice', content:'Hello, Bob!'},
  {sender:'Bob', content:'Hi, Alice!'},
  {sender:'Alice', content:'How are you?'},
  {sender:'Bob', content:'I am good, thanks!'}
]
const token = getToken();

const socket = io("http://localhost:3001");

const chatPartner = ref<string>('Alice')

</script>

<template>
  <div class="home-view" v-if="token">
    <ChatList v-model="chatPartner" class="border-right"/>
    <ChatBox user="getUsername()" :socket="socket" :recipiant="chatPartner" :conversation="msgs" /> 
  </div>
  <div v-else>
    <h1>Please login to continue</h1>
    <router-link to="/auth">Login</router-link>
  </div>
</template>

<style scoped>
.home-view {
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: top;
  justify-content: center;
  gap: 10px;
  padding: 10px;
}
.border-right {
  border-right: 1px solid var(--color-border);
}
</style>