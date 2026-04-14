import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true }, 
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/IndexPage.vue')
      },
      // Futuramente, a rota de empresas entrará aqui também
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;