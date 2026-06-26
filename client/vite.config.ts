import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), tailwindcss()],
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
})
