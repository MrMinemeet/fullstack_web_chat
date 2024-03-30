<script setup lang="ts">
defineProps<{
	sender: string
	message: string
}>()
</script>

<template>
	<div class="chat-entry">
		<h3>{{ sender }}:</h3>
		<em>{{ message }}</em>
	</div>
</template>