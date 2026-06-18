import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const equiposService = {
  async getAll(filtros = {}) {
    const response = await api.get('/equipos', {
      params: filtros
    });

    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/equipos/${id}`);
    return response.data;
  },

  async getDisponibles(categoria = null) {
    const filtros = { estado: 'disponible' };
    if (categoria) {
      filtros.categoria = categoria;
    }
    return this.getAll(filtros);
  }
};