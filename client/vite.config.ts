/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
const dirname =
    typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), tailwindcss()],
    // resolve: {
    //     alias: {
    //         '@': path.resolve(dirname, 'src'),
    //     },
    // },
    optimizeDeps: {
        exclude: ['@tailwindcss/vite'],
    },
    server: {
        port: 5173,
        strictPort: true,
        // host: '0.0.0.0',
        // origin: 'http://0.0.0.0:8080',
        proxy: {
            '/api': {
                target: API_PROXY_TARGET,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                // configure: (proxy) => {
                //     proxy.on('error', () => {})
                // },
            },
            '/images': {
                target: API_PROXY_TARGET,
                changeOrigin: true,
                // configure: (proxy) => proxy.on('error', () => {}),
            },
        },
    },
    test: {
        projects: [
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, '.storybook'),
                    }),
                ],
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [
                            {
                                browser: 'chromium',
                            },
                        ],
                    },
                },
            },
        ],
    },
})
