<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import AppBtn from './AppBtn.vue'
import { Icon } from '@iconify/vue'
import { onClickOutside } from '@vueuse/core'

const open = ref(false)

const dropdown = useTemplateRef('dropdown')

onClickOutside(dropdown, () => (open.value = false))
</script>

<template>
    <div ref="dropdown" class="relative h-6 w-6" @keydown.escape="open = false">
        <div
            :class="[
                'absolute z-10 right-0 border-1 text-sm rounded-md',
                open ?
                    'w-36 bg-slate-700 text-white  border-slate-900 shadow-lg'
                :   'border-transparent',
            ]">
            <div class="flex justify-end">
                <button
                    class="px-1 cursor-pointer h-6 focus-outline"
                    aria-label="Toggle Dropdown"
                    @click="open = !open">
                    <Icon :icon="open ? 'ri:close-fill' : 'ri:more-fill'"></Icon>
                </button>
            </div>

            <template v-if="open">
                <slot></slot>
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
