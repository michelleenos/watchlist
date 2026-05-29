import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import MoviesIndex from './pages/MoviesIndex.vue'

const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: MoviesIndex }],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
