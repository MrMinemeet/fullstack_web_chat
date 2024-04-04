import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from './pages/HomeView.vue'
import ProfileView from './pages/ProfileView.vue'
import AuthenticationView from './pages/AuthenticationView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/profile', component: ProfileView },
  { path: '/auth', component: AuthenticationView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router