<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="q-pa-md shadow-2" style="width: 400px; max-width: 90vw;">
          <q-card-section class="text-center">
            <div class="text-h5 text-primary text-weight-bold">Gestão de CNPJ</div>
            <div class="text-subtitle2 text-grey-7">Faça login para acessar o sistema</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
              <q-input
                filled
                v-model="credenciais.nomeUsuario"
                label="Nome de Usuário"
                lazy-rules
                :rules="[val => val && val.length > 0 || 'Por favor, informe o usuário']"
              />

              <q-input
                filled
                v-model="credenciais.senha"
                label="Senha"
                type="password"
                lazy-rules
                :rules="[val => val && val.length > 0 || 'Por favor, informe a senha']"
              />

              <div class="q-mt-lg">
                <q-btn
                  label="Entrar"
                  type="submit"
                  color="primary"
                  class="full-width"
                  size="large"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequestDTO } from '../schemas/LoginRequestDTO';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const credenciais = ref<LoginRequestDTO>({
  nomeUsuario: '',
  senha: ''
});

const onSubmit = async () => {
  loading.value = true;
  
  try {
    // Aqui está o await que o ESLint estava exigindo!
    await authStore.login(credenciais.value);
    
    // Se a promessa resolver (status 200 OK), joga o usuário pro Dashboard
    await router.push('/');
    
  } catch (error) {
    console.error('Falha na autenticação', error);
    // Aqui no futuro podemos colocar um Toast/Notificação de senha incorreta
  } finally {
    loading.value = false;
  }
};
</script>