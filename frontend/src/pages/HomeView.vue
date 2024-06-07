<script setup lang="ts">
import { getMessages, getToken, getUsername } from '../utils';
import ChatBox from '../components/ChatBox.vue'
import ChatList from '../components/ChatList.vue'
import { io } from "socket.io-client";
import {Ref, ref, watch } from 'vue'
import axios from 'axios';

let msgs = ref<{sender: string, content: string}[]>([])
  /*{sender:'Alice', content:'Hello, Bob!'},
  {sender:'Bob', content:'Hi, Alice!'},
  {sender:'Alice', content:'How are you?'},
  {sender:'Bob', content:'I am good, thanks!'}
])*/
const token = getToken();




const chatPartner = ref<string>('Alice')
const user = getUsername()

//TODO fix CORS for socket in chrome
let socket = io("http://localhost:3001");
socket.auth = {name: user, token: token}
socket = socket.connect();


socket.on(user, (msg: {sender: string, content: string}) => {
  console.log('Received message')
  console.log(msg)
  msgs.value.push(msg)
})


watch(() => chatPartner.value, (newVal) => {
  console.log(`Switched to chat with ${newVal}`)
  axios
      .get(`http://localhost:3000/chat/getMsgs`,
      { 
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
        responseMessages.forEach(element => {
          msgs.value.push({sender: element.sender, content: element.message})
        });
      }).catch((error) => {
        alert('Failed to load chat')
        console.error(error)
      })
})



</script>

<template>
  <div class="home-view" v-if="token">
    <ChatList v-model="chatPartner" class="border-right"/>
    <ChatBox :user="user" :socket="socket" :recipiant="chatPartner" :conversation="msgs" /> 
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