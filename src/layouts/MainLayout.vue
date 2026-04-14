<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">
          Gestão de CNPJ
        </q-toolbar-title>

        <q-btn flat round icon="logout" @click="deslogar" title="Sair do sistema" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8 text-weight-bold"> 
          Menu Principal 
        </q-item-label>

        <q-item clickable v-ripple exact to="/">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple exact to="/empresas">
          <q-item-section avatar>
            <q-icon name="business" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Gerenciar Empresas</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const leftDrawerOpen = ref(false);
const router = useRouter();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function deslogar() {
  // Limpa os dados de sessão do navegador
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redireciona de volta para a tela de login
  await router.push('/login');
}
</script>