<script setup lang="ts">
import { computed } from 'vue'
import PillItem from './PillItem.vue'

type FilterOptionObject = { value: string | number; label: string }
type FilterOption = string | number | FilterOptionObject

function optionValue(o: FilterOption) {
    return typeof o === 'object' ? (o as FilterOptionObject).value : o
}

function optionLabel(o: FilterOption): string {
    return typeof o === 'object' ? (o as FilterOptionObject).label : String(o)
}

withDefaults(
    defineProps<{
        options: FilterOption[]
        label: string
        row?: boolean
    }>(),
    { row: false },
)

const selectedOptions = defineModel<(string | number)[]>({ required: true })

const isAll = computed(() => selectedOptions.value.length === 0)

function selectAll() {
    selectedOptions.value = []
}
</script>

<template>
    <fieldset class="relative" :class="row ? 'flex items-baseline justify-between gap-4' : ''">
        <legend class="contents font-mono text-sm text-brown-600">
            {{ label }}
        </legend>
        <div class="mt-2 flex flex-wrap content-start items-start gap-2">
            <PillItem
                tag="button"
                :aria-pressed="isAll"
                selectable
                :active="isAll"
                @click="selectAll">
                All
            </PillItem>
            <div v-for="option in options" :key="optionValue(option)">
                <input
                    :id="`option-${optionValue(option)}`"
                    v-model="selectedOptions"
                    type="checkbox"
                    :value="optionValue(option)"
                    class="peer sr-only" />
                <PillItem tag="label" :for="`option-${optionValue(option)}`" selectable>
                    {{ optionLabel(option) }}
                </PillItem>
            </div>
        </div>
    </fieldset>
</template>

<style scoped lang="scss"></style>
