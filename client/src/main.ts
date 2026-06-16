import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import MoviesIndex from './pages/MoviesIndex.vue'
import MovieSingle from './pages/MovieSingle.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: MoviesIndex,
            children: [{ path: '/movie/:id', component: MovieSingle }],
        },
    ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
