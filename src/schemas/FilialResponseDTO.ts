import type { EnderecoResponseDTO } from './EnderecoResponseDTO';

export interface FilialResponseDTO {
  id: string; // UUID
  empresaId: string; // UUID
  nomeFantasia: string;
  cnpjCompleto: string;
  tipo: 'MATRIZ' | 'FILIAL';
  ativa: boolean;
  endereco: EnderecoResponseDTO;
}