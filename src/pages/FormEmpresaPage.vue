<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn icon="arrow_back" flat round color="primary" @click="$router.back()" class="q-mr-sm" />
      <div>
        <div class="text-h4 text-primary text-weight-bold">{{ isEdicao ? 'Editar Matriz' : 'Nova Empresa' }}</div>
        <div class="text-subtitle1 text-grey-7">Gestão da entidade principal do grupo</div>
      </div>
    </div>

    <q-card class="shadow-1 q-pa-md" style="max-width: 800px; margin: 0 auto;">
      <q-form @submit.prevent="salvarEmpresa" class="row q-col-gutter-md">
        
        <div class="col-12 text-h6 text-grey-8">Identificação Corporativa</div>
        
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.cnpjCompleto" label="CNPJ Matriz *" mask="##.###.###/####-##" unmasked-value :rules="[val => !!val || 'Obrigatório']" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.nomeFantasia" label="Nome Fantasia *" :rules="[val => !!val || 'Obrigatório']" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.razaoSocial" label="Razão Social" :rules="[val => !!val || 'Obrigatório']" />
        </div>

        <div class="col-12 q-mt-lg flex justify-between">
          <q-btn v-if="isEdicao" label="Excluir Matriz" color="negative" flat icon="delete" @click="confirmarExclusao" :loading="deleting" />
          <div v-else></div> <div>
            <q-btn label="Cancelar" color="grey-7" flat @click="$router.back()" />
            <q-btn :label="isEdicao ? 'Atualizar' : 'Cadastrar'" color="primary" type="submit" :loading="saving" class="q-ml-sm" />
          </div>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import api from '../services/api';
import type { EmpresaCreateDTO } from 'src/schemas/EmpresaCreateDTO';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const id = route.params.id as string;
const isEdicao = computed(() => id !== 'nova');
const saving = ref(false);
const deleting = ref(false);

const form = ref<EmpresaCreateDTO>({
    cnpjCompleto: '',
    nomeFantasia: '',
    razaoSocial: ''
});

const carregarEmpresa = async () => {
  if (!isEdicao.value) return;
  try {
    const response = await api.get(`/api/v1/empresas/${id}`);
    form.value = response.data;
  } catch (error) {
    console.error('Erro ao deletar:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados.' });
  }
};

const salvarEmpresa = async () => {
  saving.value = true;
  try {
    if (isEdicao.value) {
      await api.put(`/api/v1/empresas/${id}`, form.value);
      $q.notify({ type: 'positive', message: 'Empresa atualizada!' });
    } else {
      await api.post('/api/v1/empresas', form.value);
      $q.notify({ type: 'positive', message: 'Empresa criada!' });
    }
    await router.push({ name: 'dashboard' });
  } catch (error) {
    console.error('Erro ao deletar:', error);

    $q.notify({ type: 'negative', message: 'Erro ao salvar.' });
  } finally {
    saving.value = false;
  }
};

const confirmarExclusao = () => {
  $q.dialog({
    title: 'Cuidado!',
    message: 'Excluir a matriz pode remover todas as filiais vinculadas. Confirmar?',
    cancel: true,
    persistent: true,
    ok: { 
      label: 'Excluir Definitivamente', 
      color: 'negative', 
      flat: true 
    }
  }).onOk(() => {
    // Usamos o encadeamento .then() para evitar o retorno de Promise para o onOk
    deleting.value = true;
    
    api.delete(`/api/v1/empresas/${id}`)
      .then(async () => {
        $q.notify({ type: 'positive', message: 'Empresa removida com sucesso.' });
        // O router.push também retorna uma promise, então usamos void para silenciar o ESLint
        await router.push({ name: 'dashboard' });
      })
      .catch((error) => {
        console.error('Erro ao deletar:', error);
        $q.notify({ type: 'negative', message: 'Erro ao tentar excluir a empresa.' });
      })
      .finally(() => {
        deleting.value = false;
      });
  });
};

onMounted(carregarEmpresa);
</script>