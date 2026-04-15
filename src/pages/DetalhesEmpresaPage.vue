<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn icon="arrow_back" flat round color="primary" @click="$router.back()" class="q-mr-sm" />
      <div>
        <div class="text-h4 text-primary text-weight-bold">Detalhes da Empresa</div>
        <div class="text-subtitle1 text-grey-7">Gestão de filiais e localização</div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="shadow-1 full-height flex flex-center bg-grey-3" style="min-height: 400px;">
          <div class="text-center text-grey-6">
            <q-icon name="map" size="4rem" />
            <div class="text-h6">Espaço do Mapa</div>
            <p>Integração com Leaflet/Google Maps em breve</p>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card class="shadow-1">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-grey-8">Filiais Registadas</div>
            <q-badge color="primary" label="Filial" v-if="filiais.length > 0">
              {{ filiais.length }}
            </q-badge>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="loading" class="text-center q-pa-xl">
            <q-spinner-dots color="primary" size="40px" />
          </q-card-section>

          <q-list v-else-if="filiais.length > 0" separator>
            <q-item v-for="filial in filiais" :key="filial.id" class="q-py-md">
              <q-item-section avatar>
                <q-icon name="store" color="secondary" size="md" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ filial.nomeFantasia || 'Sem Nome Fantasia' }}
                  <q-badge :color="filial.ativa ? 'positive' : 'negative'" :label="filial.ativa ? 'Ativa' : 'Inativa'" class="q-ml-sm" />
                </q-item-label>
                <q-item-label caption class="text-mono">CNPJ: {{ filial.cnpjCompleto }}</q-item-label>
                
                <q-item-label caption class="q-mt-xs">
                  <q-icon name="place" size="xs" /> 
                  {{ filial.endereco.logradouro }}, {{ filial.endereco.numero }} - {{ filial.endereco.cidade }}/{{ filial.endereco.estado }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn flat round icon="more_vert" color="grey-7">
                  <q-menu>
                    <q-list style="min-width: 100px">
                      <q-item clickable v-close-popup>
                        <q-item-section>Editar</q-item-section>
                      </q-item>
                        <q-item clickable v-close-popup :class="filial.ativa ? 'text-negative' : 'text-positive'" @click="alternarStatusFilial(filial)">
                            <q-item-section>
                            {{ filial.ativa ? 'Desativar' : 'Ativar' }}
                            </q-item-section>                        
                        </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-section v-else class="text-center q-pa-xl text-grey-6">
            <q-icon name="info" size="3rem" />
            <div class="text-h6 q-mt-md">Nenhuma filial encontrada para esta matriz.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar'; // Importe o useQuasar
import api from '../services/api';
import type { FilialResponseDTO } from '../schemas/FilialResponseDTO';

const route = useRoute();
const $q = useQuasar(); // Instancie o utilitário
const filiais = ref<FilialResponseDTO[]>([]);
const loading = ref(false);

const carregarFiliais = async () => {
  const empresaId = route.params.id as string;
  if (!empresaId) return;

  loading.value = true;
  try {
    const response = await api.get<FilialResponseDTO[]>(`/api/v1/empresas/${empresaId}/filiais`);
    filiais.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar filiais:', error);
  } finally {
    loading.value = false;
  }
};

const alternarStatusFilial = (filial: FilialResponseDTO) => {
  const acaoTexto = filial.ativa ? 'desativar' : 'ativar';
  const novoStatus = !filial.ativa;

  $q.dialog({
    title: `Confirmar ${acaoTexto}`,
    message: filial.ativa 
      ? 'Deseja realmente desativar esta filial? Ela não aparecerá mais como ativa nos relatórios.'
      : 'Deseja reativar esta filial no sistema?',
    cancel: true,
    persistent: true,
    ok: {
      label: filial.ativa ? 'Desativar' : 'Ativar',
      color: filial.ativa ? 'negative' : 'positive',
      flat: true
    }
  }).onOk(() => {
    // Dispara o PATCH com o valor invertido
    api.patch(`/api/v1/filiais/${filial.id}`, { ativa: novoStatus })
      .then(() => {
        // Atualiza a reatividade na tela
        const filialEncontrada = filiais.value.find(f => f.id === filial.id);
        if (filialEncontrada) {
          filialEncontrada.ativa = novoStatus;
        }

        $q.notify({
          type: 'positive',
          message: `Filial ${novoStatus ? 'ativada' : 'desativada'} com sucesso.`,
          position: 'top'
        });
      })
      .catch((error) => {
        console.error(`Erro ao ${acaoTexto}:`, error);
        $q.notify({
          type: 'negative',
          message: `Ocorreu um erro ao tentar ${acaoTexto} a filial.`
        });
      });
  });
};
onMounted(async () => {
  await carregarFiliais();
});
</script>