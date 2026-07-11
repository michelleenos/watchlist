<script setup lang="ts">
import ToastNotifications from './components/ToastNotifications.vue'
import AuthFooter from './components/AuthFooter.vue'
// import ToastTest from './components/ToastTest.vue'
</script>

<template>
    <div class="relative flex min-h-screen flex-col bg-mauve-950 text-brown-100">
        <ToastNotifications />
        <div class="flex-1">
            <RouterView />
        </div>
        <AuthFooter />
    </div>
</template>
