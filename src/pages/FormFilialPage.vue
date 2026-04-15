<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn icon="arrow_back" flat round color="primary" @click="$router.back()" class="q-mr-sm" />
      <div>
        <div class="text-h4 text-primary text-weight-bold">
          {{ isEdicao ? 'Editar Filial' : 'Nova Filial' }}
        </div>
        <div class="text-subtitle1 text-grey-7">
          {{ isEdicao ? 'Atualize os dados do estabelecimento' : 'Cadastre uma nova filial para a empresa' }}
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <q-card v-else class="shadow-1 q-pa-md" style="max-width: 800px; margin: 0 auto;">
      <q-form @submit.prevent="salvarFilial" class="row q-col-gutter-md">
        
        <div class="col-12 text-h6 text-grey-8">Vínculos do Sistema</div>

        <div class="col-12 col-md-6">
          <q-input 
            outlined 
            :model-value="empresaId" 
            label="ID da Empresa Matriz" 
            readonly 
            @click="mostrarAvisoBloqueio"
          >
            <template v-slot:append><q-icon name="lock" color="negative" /></template>
          </q-input>
        </div>

        <div class="col-12 col-md-6" v-if="isEdicao">
          <q-input 
            outlined 
            :model-value="filialId" 
            label="ID da Filial" 
            readonly 
            @click="mostrarAvisoBloqueio"
          >
            <template v-slot:append><q-icon name="lock" color="negative" /></template>
          </q-input>
        </div>

        <div class="col-12 text-h6 text-grey-8 q-mt-md">Dados Básicos</div>
        
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.cnpjCompleto" label="CNPJ Completo *" mask="##.###.###/####-##" unmasked-value :rules="[val => !!val || 'CNPJ é obrigatório']" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.nomeFantasia" label="Nome Fantasia" />
        </div>
        <div class="col-12 col-md-12" v-if="isEdicao">
          <q-toggle v-model="form.ativa" label="Status da Filial (Ativa/Inativa)" color="primary" />
        </div>

        <div class="col-12 text-h6 text-grey-8 q-mt-md">Endereço</div>

        <div class="col-12 col-md-4">
          <q-input outlined v-model="form.endereco.cep" label="CEP *" mask="#####-###" unmasked-value :rules="[val => !!val || 'CEP obrigatório']" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.endereco.logradouro" label="Logradouro *" :rules="[val => !!val || 'Obrigatório']" />
        </div>
        <div class="col-12 col-md-2">
          <q-input outlined v-model="form.endereco.numero" label="Número *" :rules="[val => !!val || 'Obrigatório']" />
        </div>

        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.endereco.cidade" label="Cidade *" :rules="[val => !!val || 'Obrigatório']" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.endereco.estado" label="Estado (UF) *" mask="AA" :rules="[val => !!val || 'Obrigatório']" />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input outlined v-model.number="form.endereco.latitude" label="Latitude (para o Mapa)" type="number" step="any" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model.number="form.endereco.longitude" label="Longitude (para o Mapa)" type="number" step="any" />
        </div>

        <div class="col-12 q-mt-lg flex justify-between items-center">
          <div>
            <q-btn 
              v-if="isEdicao" 
              label="Excluir Filial" 
              color="negative" 
              flat 
              icon="delete" 
              @click="confirmarExclusao" 
              :loading="deleting" 
            />
          </div>
          
          <div>
            <q-btn label="Cancelar" color="grey-7" flat class="q-mr-sm" @click="$router.back()" />
            <q-btn :label="isEdicao ? 'Salvar Alterações' : 'Cadastrar Filial'" color="primary" type="submit" :loading="saving" />
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
import type { FilialCreateDTO } from 'src/schemas/FilialCreateDTO';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Identificadores baseados na rota
const empresaId = route.params.empresaId as string;
const filialId = route.params.filialId as string;
const isEdicao = computed(() => filialId !== 'nova');

// Estados de carregamento
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);

// Objeto reativo do formulário
const form = ref<FilialCreateDTO>({
  empresaId: empresaId,
  cnpjCompleto: '',
  nomeFantasia: '',
  tipo: 'FILIAL' as const,
  ativa: true,
  endereco: {
    cep: '',
    logradouro: '',
    numero: '',
    cidade: '',
    estado: '',
    latitude: 0,
    longitude: 0
  }
});

// Alerta visual de bloqueio de edição
const mostrarAvisoBloqueio = () => {
  $q.notify({
    type: 'negative',
    message: 'Ação Bloqueada: Este campo é gerido pelo sistema e não pode ser alterado.',
    position: 'bottom',
    icon: 'block',
    timeout: 3000
  });
};

// Carrega os dados caso seja uma edição
const carregarDadosFilial = async () => {
  if (!isEdicao.value) return;

  loading.value = true;
  try {
    const response = await api.get(`/api/v1/filiais/${filialId}`);
    form.value = { ...form.value, ...response.data };
  } catch (error) {
    console.error('Erro ao carregar filial:', error);
    $q.notify({ type: 'negative', message: 'Erro ao buscar dados da filial.' });
    router.back();
  } finally {
    loading.value = false;
  }
};

// Salva a filial (POST para criar, PUT para atualizar)
const salvarFilial = async () => {
  saving.value = true;
  try {
    if (isEdicao.value) {
      // payloadUpdate estrito para o backend não rejeitar
      const payloadUpdate = {
        cnpjCompleto: form.value.cnpjCompleto,
        nomeFantasia: form.value.nomeFantasia,
        tipo: form.value.tipo,
        ativa: form.value.ativa,
        endereco: {
          cep: form.value.endereco.cep,
          logradouro: form.value.endereco.logradouro,
          numero: form.value.endereco.numero,
          cidade: form.value.endereco.cidade,
          estado: form.value.endereco.estado,
          latitude: form.value.endereco.latitude,
          longitude: form.value.endereco.longitude
        }
      };

      await api.put(`/api/v1/filiais/${filialId}`, payloadUpdate);
      $q.notify({ type: 'positive', message: 'Filial atualizada com sucesso!' });
    } else {
      await api.post(`/api/v1/filiais`, form.value);
      $q.notify({ type: 'positive', message: 'Filial cadastrada com sucesso!' });
    }
    
    router.back();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    $q.notify({ type: 'negative', message: 'Erro ao salvar os dados da filial. Verifique o console.' });
  } finally {
    saving.value = false;
  }
};

// Deleta a filial após confirmação
const confirmarExclusao = () => {
  $q.dialog({
    title: 'Excluir Filial',
    message: 'Tem certeza que deseja excluir esta filial permanentemente? Esta ação removerá o registro do banco de dados e não pode ser desfeita.',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Excluir Definitivamente',
      color: 'negative',
      flat: true
    }
  }).onOk(() => {
    deleting.value = true;
    api.delete(`/api/v1/filiais/${filialId}`)
      .then(() => {
        $q.notify({ type: 'positive', message: 'Filial excluída com sucesso!' });
        router.back();
      })
      .catch((error) => {
        console.error('Erro ao excluir:', error);
        $q.notify({ type: 'negative', message: 'Ocorreu um erro ao tentar excluir a filial.' });
      })
      .finally(() => {
        deleting.value = false;
      });
  });
};

onMounted(() => {
  void carregarDadosFilial();
});
</script>