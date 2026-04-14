import type { EnderecoUpdateDTO } from './EnderecoUpdateDTO';

export interface FilialUpdateDTO {
    cnpjCompleto?: string;
    tipo?: 'MATRIZ' | 'FILIAL';
    ativa?: boolean;
    endereco?: EnderecoUpdateDTO;
}