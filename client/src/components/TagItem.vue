<script setup lang="ts">
defineProps<{
    content: string
    tagName?: string
    maxWidth?: boolean | number
    noWrap?: boolean
    button?: boolean
    active?: boolean
}>()
</script>

<template>
    <component
        :is="tagName || 'div'"
        :tooltip="typeof maxWidth === 'number' && content.length > maxWidth ? content : undefined"
        :class="[
            'tag',
            button && 'cursor-pointer hover:bg-blue-200 focus:bg-blue-200',
            active && 'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700',
        ]">
        <span
            :class="[
                'tag__content inline-block overflow-ellipsis max-w-full overflow-x-hidden leading-4 text-sm',
                maxWidth && 'max-w-[150px] whitespace-nowrap',
                noWrap && 'whitespace-nowrap',
            ]"
            :style="{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}ch` : undefined }">
            {{ content }}
        </span>
    </component>
</template>

<style lang="css">
@reference '../style.css';

.tag[tooltip] {
    &:before {
        content: '';
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 4px 6px 0 6px;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.7) transparent transparent transparent;
        z-index: 100;
        opacity: 0;
        visibility: hidden;
    }
    &:after {
        content: attr(tooltip);
        position: absolute;
        left: 50%;
        top: -6px;
        transform: translateX(-50%) translateY(-100%);
        background: rgba(0, 0, 0, 0.7);
        text-align: center;
        color: #fff;
        padding: 4px 5px;
        font-size: 12px;
        min-width: 80%;
        border-radius: 5px;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
    }

    &:hover,
    &:focus {
        &:before,
        &:after {
            opacity: 1;
            visibility: visible;
        }
    }
}
</style>
