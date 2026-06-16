<script setup lang="ts" generic="TValue extends string | number">
import { computed } from 'vue'
import PillItem from './PillItem.vue'

type FilterOptionObject = { value: TValue; label: string }
type FilterOption = TValue | FilterOptionObject

function optionValue(o: FilterOption): TValue {
    return typeof o === 'object' ? (o as FilterOptionObject).value : (o as TValue)
}

function optionLabel(o: FilterOption): string {
    return typeof o === 'object' ? (o as FilterOptionObject).label : String(o)
}

defineProps<{
    options: FilterOption[]
    label: string
}>()

const selectedOptions = defineModel<TValue[]>({ required: true })

const isAll = computed(() => selectedOptions.value.length === 0)

function selectAll() {
    selectedOptions.value = []
}
</script>

<template>
    <fieldset>
        <legend class="font-mono text-sm text-brown-600">
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
