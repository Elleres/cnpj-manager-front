<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="text-h4 text-primary text-weight-bold">Dashboard</div>
        <div class="text-subtitle1 text-grey-7">Visão geral do sistema de Gestão de CNPJ</div>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-primary text-white shadow-2">
          <q-card-section>
            <div class="text-h6">Empresas Cadastradas</div>
            <div class="text-h3 text-weight-bold">{{ empresas.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-secondary text-white shadow-2">
          <q-card-section>
            <div class="text-h6">Filiais Ativas</div>
            <div class="text-h3 text-weight-bold">--</div>
            <div class="text-subtitle2">Aguardando rota de métricas</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 q-mt-lg">
        <q-card class="shadow-1">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-grey-8">Lista de Empresas</div>
            
            <q-btn 
              icon="refresh" 
              flat 
              round 
              color="primary" 
              @click="carregarEmpresas" 
              :loading="loading"
              title="Atualizar lista"
            />
          </q-card-section>

          <q-card-section v-if="loading && empresas.length === 0" class="text-center q-pa-lg">
            <q-spinner color="primary" size="3em" />
            <div class="text-grey-7 q-mt-sm">Carregando dados da API...</div>
          </q-card-section>

          <q-card-section v-else-if="empresas.length > 0">
            <q-list bordered separator class="rounded-borders bg-white">
              <q-item 
                v-for="empresa in empresas" 
                :key="empresa.id"
                clickable 
                v-ripple
                @click="irParaDetalhes(empresa.id)"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="business" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ empresa.razaoSocial }}</q-item-label>
                  <q-item-label caption>
                    Nome Fantasia: {{ empresa.nomeFantasia || 'N/A' }} | CNPJ Raiz: {{ empresa.cnpjRaiz }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" size="sm" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-section v-else class="text-center q-pa-lg">
            <q-icon name="domain_disabled" size="4em" color="grey-4" />
            <div class="text-grey-6 text-h6 q-mt-md">Nenhuma empresa cadastrada.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import type { EmpresaResponseDTO } from '../schemas/EmpresaResponseDTO';

const router = useRouter();
const loading = ref(false);

// Estado para armazenar a lista de empresas
const empresas = ref<EmpresaResponseDTO[]>([]);

const carregarEmpresas = async () => {
  loading.value = true;

  try {
    // Agora tipamos o retorno do Axios diretamente como um Array de DTOs
    const response = await api.get<EmpresaResponseDTO[]>('/api/v1/empresas');
    
    // Como a API já retorna o array, atribuímos diretamente
    empresas.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
    alert('Erro ao carregar a lista de empresas da API.');
  } finally {
    loading.value = false;
  }
};

const irParaDetalhes = async (id?: string) => {
  if (!id) return;
  await router.push({ path: `/empresas/${id}/detalhes` });
};

// Executa a busca automaticamente quando o componente é montado na tela
onMounted(async () => {
  await carregarEmpresas();
});
</script>