export interface EnderecoResponseDTO {
    id: string; // UUID
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
    cep: string;
    latitude: number;
    longitude: number;
}