import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), tailwindcss()],
    optimizeDeps: {
        exclude: ['@tailwindcss/vite'],
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                // configure: (proxy) => {
                //     proxy.on('error', () => {})
                // },
            },
            '/images': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                // configure: (proxy) => proxy.on('error', () => {}),
            },
        },
    },
})
