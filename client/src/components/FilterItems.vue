<script setup lang="ts">
import { computed } from 'vue'

defineProps<{
    options: string[]
    label: string
}>()

const selectedOptions = defineModel<string[]>({ required: true })

const isAll = computed(() => selectedOptions.value.length === 0)

function selectAll() {
    selectedOptions.value = []
}
</script>

<template>
    <fieldset>
        <legend class="text-brown-600 font-mono text-sm">
            {{ label }}
        </legend>
        <div class="mt-2 flex flex-wrap gap-2">
            <button
                type="button"
                :aria-pressed="isAll"
                class="btn"
                :class="isAll ? '' : 'btn--outline'"
                @click="selectAll">
                All
            </button>
            <div v-for="(option, i) in options" :key="option">
                <input
                    :id="`option-${i}`"
                    v-model="selectedOptions"
                    type="checkbox"
                    :value="option"
                    class="peer sr-only" />
                <label
                    :for="`option-${i}`"
                    class="btn btn--outline peer-checked:bg-brass peer-checked:border-brass peer-checked:text-brown-950 peer-focus-visible:outline-brass peer-focus-visible:outline-2">
                    {{ option }}
                </label>
            </div>
        </div>
    </fieldset>
</template>

<style scoped lang="scss"></style>
