<script setup lang="ts">
defineProps<{
    title: string
    description: string
}>()
</script>

<template>
    <div>
        <dt class="label">{{ title }}</dt>
        <dd class="text-sm">{{ description }}</dd>
    </div>
</template>
