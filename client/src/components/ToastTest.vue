<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { add } = useToast()
</script>

<template>
    <div class="fixed top-4 left-4 z-99">
        <button
            class="mr-4 bg-amber-100 text-brown-900"
            @click="() => add('I am a toast toast toast', 'success', false)">
            add a successful toast
        </button>
        <button
            class="bg-amber-100 text-brown-900"
            @click="() => add('I am an unsuccessful thingy', 'error', false)">
            add an error toast
        </button>
    </div>
</template>
