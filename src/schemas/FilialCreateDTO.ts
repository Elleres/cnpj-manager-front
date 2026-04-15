import type { EnderecoCreateDTO } from './EnderecoCreateDTO';

export interface FilialCreateDTO {
  empresaId: string; // UUID
  cnpjCompleto: string;
  nomeFantasia: string;
  tipo: 'MATRIZ' | 'FILIAL';
  ativa: boolean;
  endereco: EnderecoCreateDTO;
}