import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : createWebHistory;

  // ... código anterior ...
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  // BLOCO ATUALIZADO
  Router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (!isAuthenticated && to.name !== 'login') {

      next({ name: 'login' });
    }
    else if (isAuthenticated && to.name === 'login') {
      next({ name: 'dashboard' });
    }
    else {
      next();
    }
  });

  return Router;
});