<script setup lang="ts">
defineProps<{
	imgSrc: string
}>()
</script>

<template>
	<img class="userImage" :src="imgSrc" width="40" height="40"/>
</template>

<style scoped>
.userImage {
	border-radius: 50%;
}
</style>