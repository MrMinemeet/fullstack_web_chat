<script setup lang="ts">
import { io } from "socket.io-client";
import { ref, watch } from 'vue'
import axios from 'axios';

import { getToken, getUsername } from '@/utils';
import ChatBox from '@/components/ChatBox.vue'
import ChatList from '@/components/ChatList.vue'
import { NOT_SELECTED, API_URL } from '@/constants';

let msgs = ref<{sender: string, content: string, fileName: string, fileId: number}[]>([])
const token = getToken();


const chatPartner = ref<string>(NOT_SELECTED)
const user = getUsername()

//TODO fix CORS for socket in chrome
let socket = io("http://localhost:3001");
socket.auth = {name: user, token: token}
socket = socket.connect();


socket.on('message', (msg: {sender: string; content: string; fileName: string; fileId: number;}) => {
  if(msg.sender == chatPartner.value) {
    console.log('Received message from: ' + msg.sender)
    msgs.value.push(msg)
  }
})


watch(() => chatPartner.value, (newVal) => {
  console.log(`Switched to chat with ${newVal}`)
  axios .get(`http://${API_URL}/chat/getMsgs`, { 
    headers: {
      Authorization: `Bearer ${getToken()}` 
    },
    params: {
      username1: getUsername(),
      username2: chatPartner.value
    } 
  }).then((response) => {
    console.log(response.data)
    msgs.value.splice(0)
    const responseMessages = response.data 
    responseMessages.forEach((element: any) => {
      msgs.value.push({sender: element.sender, content: element.message || '', fileName: element.fileName, fileId: element.fileId})
    });
  }).catch((error) => {
    alert(`Failed to load chat:\n${error?.response?.data?.message || error?.message || error}`)
    console.error(error)
  })
})
</script>

<template>
  <div class="home-view" v-if="token">
    <ChatList :socket="socket" v-model="chatPartner" class="border-right"/>
    <ChatBox :user="user" :socket="socket" :recipiant="chatPartner" v-model="msgs" /> 
  </div>
  <div v-else>
    <h1>Please login to continue</h1>
    <router-link to="/auth">Login</router-link>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
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