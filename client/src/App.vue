<script setup lang="ts">
import ToastNotifications from './components/ToastNotifications.vue'
// import ToastTest from './components/ToastTest.vue'
</script>

<template>
    <div class="relative min-h-screen bg-mauve-950 text-brown-100">
        <ToastNotifications />
        <RouterView />
    </div>
</template>
