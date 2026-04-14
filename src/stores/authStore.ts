import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';
import type { LoginRequestDTO } from '../schemas/LoginRequestDTO';
import type { TokenResponseDTO } from '../schemas/TokenResponseDTO';

export const useAuthStore = defineStore('auth', () => {
    // Inicializa o estado com o token do localStorage (se existir)
    const token = ref<string | null>(localStorage.getItem('token'));

    // Função que bate no seu endpoint Java
    const login = async (credenciais: LoginRequestDTO) => {
        const response = await api.post<TokenResponseDTO>('/api/v1/auth/login', credenciais);

        if (response.data.token) {
            token.value = response.data.token;
            localStorage.setItem('token', response.data.token);
        }
    };

    const logout = () => {
        token.value = null;
        localStorage.removeItem('token');
    };

    return { token, login, logout };
});