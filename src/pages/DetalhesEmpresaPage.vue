<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn icon="arrow_back" flat round color="primary" @click="$router.back()" class="q-mr-sm" />
      <div>
        <div class="text-h4 text-primary text-weight-bold">Detalhes da Empresa</div>
        <div class="text-subtitle1 text-grey-7">Gestão de filiais e localização</div>
      </div>
    </div>

    <q-btn 
        label="Excluir Empresa" 
        icon="delete_forever" 
        color="negative" 
        outline 
        @click="confirmarExclusaoEmpresa"
        :loading="deletingEmpresa"
      />

    <div class="row q-col-gutter-md">
        <div class="col-12 col-md-5">
        <q-card class="shadow-1 overflow-hidden" style="height: 500px;">
            <div id="map-container" style="height: 100%; width: 100%;"></div>
        </q-card>
        </div>

      <div class="col-12 col-md-7">
        <q-card class="shadow-1">
            <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-grey-8">Filiais Registradas</div>
            <div>
              <q-badge color="primary" class="q-mr-sm" v-if="filiais.length > 0">
                {{ filiais.length }}
              </q-badge>
              <q-btn color="primary" icon="add" label="Nova" size="sm" @click="irParaFormulario('nova')" />
            </div>
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
                <q-btn flat round icon="more_vert" color="grey-7" @click.stop>
                  <q-menu>
                    <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="irParaFormulario(filial.id)">
                        <q-item-section avatar>
                            <q-icon name="edit" size="sm" color="grey-7" />
                        </q-item-section>
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
import { ref, shallowRef, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar'; 
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import type { FilialResponseDTO } from '../schemas/FilialResponseDTO';

// @ts-expect-error O Leaflet modifica o protótipo internamente e quebra a tipagem
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const router = useRouter();
const route = useRoute();
const $q = useQuasar(); 
const filiais = ref<FilialResponseDTO[]>([]);
const loading = ref(false);

// Variáveis do Mapa
const mapInstance = shallowRef<L.Map | null>(null);
const markerLayer = shallowRef<L.LayerGroup | null>(null);

const inicializarMapa = () => {
  mapInstance.value = L.map('map-container').setView([-1.4558, -48.4902], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance.value);
  markerLayer.value = L.layerGroup().addTo(mapInstance.value);
};

const atualizarMarcadores = () => {
  if (!mapInstance.value || !markerLayer.value) return;
  
  markerLayer.value.clearLayers();
  const pontos: L.LatLngExpression[] = [];

  filiais.value.forEach((filial) => {
    const { latitude, longitude } = filial.endereco;
    if (latitude && longitude) {
      const coord: L.LatLngExpression = [latitude, longitude];
      pontos.push(coord);
      L.marker(coord)
        .bindPopup(`
          <strong>${filial.nomeFantasia || 'Filial'}</strong><br>
          ${filial.endereco.logradouro}, ${filial.endereco.numero}<br>
          Status: ${filial.ativa ? 'Ativa' : 'Inativa'}
        `)
        .addTo(markerLayer.value!);
    }
  });

  if (pontos.length > 0) {
    const bounds = L.latLngBounds(pontos);
    mapInstance.value.fitBounds(bounds, { padding: [50, 50] });
  }
};

const carregarFiliais = async () => {
  const empresaId = route.params.id as string;
  loading.value = true;
  
  try {
    const response = await api.get<FilialResponseDTO[]>(`/api/v1/empresas/${empresaId}/filiais`);
    filiais.value = response.data;
    
    await nextTick();
    atualizarMarcadores();
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
    api.patch(`/api/v1/filiais/${filial.id}`, { ativa: novoStatus })
      .then(() => {
        const filialEncontrada = filiais.value.find(f => f.id === filial.id);
        if (filialEncontrada) {
          filialEncontrada.ativa = novoStatus;
          atualizarMarcadores(); 
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

const irParaFormulario = async (filialId: string) => {
const empresaId = route.params.id as string;
  // O Vue Router vai trocar a URL para a nossa nova tela
await router.push(`/empresas/${empresaId}/filiais/${filialId}`);
};


const deletingEmpresa = ref(false);

const confirmarExclusaoEmpresa = () => {
  const empresaId = route.params.id as string;

  $q.dialog({
    title: 'Excluir Matriz?',
    message: 'Atenção: Esta ação é irreversível. Ao excluir a matriz, todas as filiais vinculadas também serão removidas do sistema.',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Sim, Excluir Tudo',
      color: 'negative',
      flat: true
    }
  }).onOk(() => {
    deletingEmpresa.value = true;
    
    api.delete(`/api/v1/empresas/${empresaId}`)
      .then(async () => {
        $q.notify({
          type: 'positive',
          message: 'Empresa e suas filiais removidas com sucesso.',
          position: 'top'
        });
        // Redireciona para o Dashboard (IndexPage)
        await router.push({ name: 'dashboard' });
      })
      .catch((error) => {
        console.error('Erro ao excluir empresa:', error);
        $q.notify({
          type: 'negative',
          message: 'Erro ao tentar excluir a empresa. Verifique as dependências.'
        });
      })
      .finally(() => {
        deletingEmpresa.value = false;
      });
  });
};

onMounted(async () => {
    inicializarMapa();
    await carregarFiliais();
});
</script>