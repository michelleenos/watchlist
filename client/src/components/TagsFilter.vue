<script setup lang="ts">
import TagItem from './TagItem.vue'

const props = defineProps<{
    items: string[]
    selectedItems: string[]
    label: string
}>()

const emits = defineEmits<{
    (e: 'update', value: string[]): void
}>()

const toggleItem = (item: string) => {
    if (props.selectedItems.includes(item)) {
        emits(
            'update',
            props.selectedItems.filter((i) => i !== item),
        )
    } else {
        emits('update', [...props.selectedItems, item])
    }
}
</script>

<template>
    <div class="mt-4">
        <div class="flex justify-between items-center mb-2">
            <div class="font-semibold text-lg mb-1 leading-none">{{ label }}</div>
            <button
                :class="['btn btn--text', selectedItems.length === 0 && 'invisible opacity-0']"
                :aria-hidden="selectedItems.length === 0"
                @click="$emit('update', [])">
                Clear
            </button>
        </div>
        <div class="taglist tagsfilter__list">
            <TagItem
                v-for="(item, i) in items"
                :key="i"
                :content="item"
                tagName="button"
                :button="true"
                :active="selectedItems.includes(item)"
                @click="toggleItem(item)" />
        </div>
    </div>
</template>
