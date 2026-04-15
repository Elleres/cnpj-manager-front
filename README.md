# CNPJ Manager Web
**Interface administrativa para gestão geolocalizada de grupos empresariais e suas filiais.**

## Visão Geral
O **CNPJ Manager Web** é o frontend do ecossistema de gestão de ativos do grupo. Ele resolve o problema de centralização de dados cadastrais de múltiplas unidades de negócio, permitindo que gestores visualizem a distribuição geográfica das filiais em tempo real, gerenciem o status operacional (Ativa/Inativa) e mantenham a integridade dos dados fiscais (CNPJ) através de uma interface intuitiva e segura.

## Stack de Tecnologias
* **Linguagem:** TypeScript
* **Framework principal:** Vue.js 3 (Composition API)
* **Framework UI:** Quasar Framework v2
* **Bibliotecas principais:** Leaflet (Mapas), Axios (HTTP), Vue Router (Navegação)
* **Banco de dados:** Oracle DB (via API Spring Boot)
* **Infraestrutura:** Docker (Containerização)

## Principais Funcionalidades
* **Dashboard de Matrizes:** Visualização e busca de empresas principais cadastradas no sistema.
* **Mapa Interativo de Filiais:** Integração com Leaflet para plotagem automática de filiais baseada em coordenadas $lat$ e $long$.
* **Gestão de Status:** Ativação/Desativação de filiais com atualização reativa da interface.
* **CRUD Híbrido:** Formulários inteligentes que alternam entre criação e edição conforme o contexto da rota.
* **Segurança de Dados:** Bloqueio de edição para campos críticos de sistema e tratamento rigoroso de payloads via DTOs.

## Guia de Onboarding

### Pré-requisitos
* **Node.js** >= 20.x
* **Quasar CLI** (Opcional, pode usar via `npm`)
* **API Spring Boot** em execução na porta `8080`

### Instalação e Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/ArthurEstudos/cnpj-manager-web.git
cd cnpj-manager-web

# 2. Configure as variáveis de ambiente (URL da API)
# Certifique-se de que a baseURL no src/services/api.ts aponta para seu backend

# 3. Instale as dependências
npm install
```

### Como Compilar
```bash
npm run build
```

### Como Executar

**Desenvolvimento**
```bash
npm run dev
```

**Produção**
```bash
# Servir os arquivos estáticos gerados na pasta /dist/spa
npm start
```

**Com Docker**
```bash
docker compose up -d
```


## Ondas de Desenvolvimento
| Onda | Nome | Status | Período | Pasta |
| :--- | :--- | :--- | :--- | :--- |
| 1 | MVP - Listagem e Auth | Entregue | 2026-04 / 2026-04 | `_docs/1-mvp/` |
| 2 | Geolocalização e Gestão | Entregue | 2026-04 / 2026-04 | `_docs/2-geo/` |
