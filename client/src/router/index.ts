import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { authenticate } from './guards'
import ProjectLayout from '@/layouts/ProjectLayout.vue'

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
        {
          path: 'projects',
          children: [
            {
              path: '',
              name: 'Projects',
              component: () => import('../views/ProjectsView.vue'),
            },
            {
              path: ':id',
              component: ProjectLayout,
              props: true,
              children: [
                {
                  path: 'details',
                  name: 'Project',
                  component: () => import('../views/ProjectDetailsView.vue'),
                },
                {
                  path: 'update',
                  name: 'update',
                  component: () => import('../views/ProjectForm.vue'),
                },
                {
                  path: 'add-participant',
                  name: 'Add Participant',
                  component: () => import('../views/AddParticipantView.vue'),
                },
                { path: 'tasks', name: 'Tasks', component: () => import('../views/TasksView.vue') },
                {
                  path: 'add-task',
                  name: 'Add Task',
                  component: () => import('../views/TaskFormView.vue'),
                },
                {
                  path: 'calendar',
                  name: 'Calendar',
                  component: () => import('../views/CalendarView.vue'),
                },
              ],
            },

            {
              path: 'new',
              name: 'add project',
              component: () => import('../views/ProjectForm.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/',
      component: () => import('../views/HomeView.vue'),
    },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/forgot-password', component: () => import('../views/ForgotPasswordView.vue') },
    { path: '/reset-password', component: () => import('../views/ResetPasswordView.vue') },
    { path: '/signup', component: () => import('../views/SignupView.vue') },
  ],
})

export default router
