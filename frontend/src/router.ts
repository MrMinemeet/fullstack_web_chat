import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from './pages/HomeView.vue'
import ProfileView from './pages/ProfileView.vue'
import AuthenticationView from './pages/AuthenticationView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/auth', component: AuthenticationView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

// Check if user has to be authenticated, and if so redirect to /auth when not authenticated
router.beforeEach((to, from, next) => {
  const token = document.cookie.split(";").find((c) => c.startsWith("token="))?.split("=")[1];
  if (!to.matched.some(record => record.meta.requiresAuth) || token) {
    // No auth needed or auth token is present
    next();
  }

  // Auth needed
  next('/auth');
});

export default router