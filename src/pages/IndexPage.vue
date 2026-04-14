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
            <div class="text-h3 text-weight-bold">--</div>
            <div class="text-subtitle2">Aguardando rota de métricas</div>
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
          <q-card-section>
            <div class="text-h6 text-grey-8 q-mb-md">Busca Rápida de Empresa</div>
            
            <q-form @submit.prevent="buscarEmpresa" class="row q-col-gutter-sm items-start">
              <div class="col-12 col-md-8">
                <q-input 
                  outlined 
                  v-model="empresaIdBusca" 
                  label="Digite o ID (UUID) da Empresa"
                  dense
                  hide-bottom-space
                  :rules="[val => !!val || 'O ID é obrigatório']"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-4">
                <q-btn 
                  label="Buscar na API" 
                  color="primary" 
                  type="submit" 
                  class="full-width" 
                  style="height: 40px;" 
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section v-if="empresasEncontradas.length > 0">
            <q-separator class="q-mb-md" />
            <div class="text-subtitle2 text-grey-8 q-mb-sm">Resultados Encontrados:</div>
            
            <q-list bordered separator class="rounded-borders bg-white">
              <q-item 
                v-for="empresa in empresasEncontradas" 
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
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import type { EmpresaResponseDTO } from '../schemas/EmpresaResponseDTO';

const router = useRouter();
const empresaIdBusca = ref('');
const loading = ref(false);

// Transformamos em array para suportar listas, mesmo que a API traga só 1 por ID no momento
const empresasEncontradas = ref<EmpresaResponseDTO[]>([]);

const buscarEmpresa = async () => {
  loading.value = true;
  empresasEncontradas.value = []; // Limpa a lista antes de buscar

  try {
    const response = await api.get<EmpresaResponseDTO>(`/api/v1/empresas/${empresaIdBusca.value}`);
    // Coloca o resultado único dentro de um array para o v-for funcionar
    empresasEncontradas.value = [response.data];
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    alert('Empresa não encontrada ou erro na API.');
  } finally {
    loading.value = false;
  }
};

const irParaDetalhes = async (id?: string) => {
  if (!id) return;
  // Navega para a futura tela de detalhes, passando o UUID na URL
  await router.push({ path: `/empresas/${id}/detalhes` });
};
</script>