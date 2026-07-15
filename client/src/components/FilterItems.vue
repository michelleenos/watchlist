<script setup lang="ts">
import { computed, useId } from 'vue'
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

const model = defineModel<(string | number)[] | null | string>({ required: true })
const isMultiple = computed(() => {
    if (Array.isArray(model.value)) return true
    return false
})

const isAll = computed(() =>
    Array.isArray(model.value) ? model.value.length === 0 : model.value === null,
)

function selectAll() {
    if (Array.isArray(model.value)) {
        model.value = []
    } else {
        model.value = null
    }
}

const groupName = useId()
</script>

<template>
    <fieldset class="relative" :class="row ? 'flex items-baseline gap-4' : ''">
        <legend class="contents font-mono text-sm text-brown-600">
            {{ label }}
        </legend>
        <div class="mt-2 flex flex-wrap content-start items-start gap-2">
            <PillItem
                tag="button"
                :aria-pressed="isAll"
                interactive
                :active="isAll"
                @click="selectAll">
                All
            </PillItem>
            <div v-for="option in options" :key="optionValue(option)">
                <input
                    :id="`option-${groupName}-${optionValue(option)}`"
                    v-model="model"
                    :name="groupName"
                    :type="isMultiple ? 'checkbox' : 'radio'"
                    :value="optionValue(option)"
                    class="peer sr-only" />
                <PillItem
                    tag="label"
                    :for="`option-${groupName}-${optionValue(option)}`"
                    class="peer-focus-visible:outline-2 peer-focus-visible:outline-brass"
                    interactive
                    :active="
                        Array.isArray(model) ?
                            model.includes(optionValue(option))
                        :   model === optionValue(option)
                    ">
                    {{ optionLabel(option) }}
                </PillItem>
            </div>
        </div>
    </fieldset>
</template>

<style scoped lang="scss"></style>
