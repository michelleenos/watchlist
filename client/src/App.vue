<script setup lang="ts">
import ToastNotifications from './components/ToastNotifications.vue'
// import ToastTest from './components/ToastTest.vue'
</script>

<template>
    <div class="relative min-h-screen overflow-y-hidden bg-mauve-950 text-brown-100">
        <!-- <ToastTest /> -->
        <ToastNotifications />
        <RouterView />
    </div>
</template>
