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
      {
        path: 'empresas/:id/detalhes',
        name: 'empresa-detalhes',
        component: () => import('pages/DetalhesEmpresaPage.vue')
      },
      {
        path: 'empresas/:empresaId/filiais/:filialId',
        name: 'filial-form',
        component: () => import('pages/FormFilialPage.vue')
      }

    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;