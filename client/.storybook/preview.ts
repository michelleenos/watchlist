/// <reference types="vite/client" />

import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { createRouter, createMemoryHistory } from 'vue-router'
import '../src/style.css'
import { sb } from 'storybook/test'

sb.mock(import('../src/composables/useMovies.ts'))
sb.mock(import('../src/composables/useAuth.ts'))

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
    decorators: [
        () => ({
            // base/root styles
            template: '<div class="bg-mauve-950 text-brown-100 p-6"><story /></div>',
        }),
    ],
    parameters: {
        backgrounds: {
            options: {
                dark: { name: 'Dark (default)', value: 'var(--color-mauve-950)' },
            },
        },
        // backgrounds: { disable: true },
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
    initialGlobals: {
        backgrounds: { value: 'dark' },
    },
}

export default preview
