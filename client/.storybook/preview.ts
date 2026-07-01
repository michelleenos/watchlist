/// <reference types="vite/client" />

import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { createRouter, createMemoryHistory } from 'vue-router'
import '../src/style.css'
import { sb } from 'storybook/test'

sb.mock(import('../src/composables/useMovies.ts'))

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/movie/:id', component: { template: '<div />' } },
    ],
})

setup((app) => {
    app.use(router)
})

const preview: Preview = {
    // Wrap every story in the app's root shell (see App.vue) so components
    // render on the dark background with light text, as in the real app.
    decorators: [
        () => ({
            template: '<div class="bg-mauve-950 text-brown-100 p-6"><story /></div>',
        }),
    ],
    parameters: {
        // Let the decorator own the background instead of Storybook's white default.
        backgrounds: { disable: true },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },

        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: 'todo',
        },
    },
}

export default preview
