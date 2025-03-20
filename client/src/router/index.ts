import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { authenticate } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      component: MainLayout,
      beforeEnter: [authenticate],
      children: [
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/ProfileView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('../views/HomeView.vue'),
    },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/signup', component: () => import('../views/SignupView.vue') },
  ],
})

export default router
