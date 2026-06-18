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

export const solicitudesService = {
  // GET con filtros y paginación
  async getAll(filtros = {}) {
    const response = await api.get('/solicitudes', { params: filtros });
    return response.data;
  },

  // GET de un recurso específico
  async getById(id) {
    const response = await api.get(`/solicitudes/${id}`);
    return response.data;
  },

  // POST crear nueva solicitud
  async create(datos) {
    const response = await api.post('/solicitudes', datos);
    return response.data;
  },

  // PUT actualizar solicitud (fechas, motivo - solo si está pendiente)
  async update(id, datos) {
    const response = await api.put(`/solicitudes/${id}`, datos);
    return response.data;
  },

  // PATCH máquina de estados
  async cancelar(id) {
    const response = await api.patch(`/solicitudes/${id}/cancelar`);
    return response.data;
  },

  async aprobar(id) {
    const response = await api.patch(`/solicitudes/${id}/aprobar`);
    return response.data;
  },

  async rechazar(id) {
    const response = await api.patch(`/solicitudes/${id}/rechazar`);
    return response.data;
  },

  async devolver(id) {
    const response = await api.patch(`/solicitudes/${id}/devolver`);
    return response.data;
  }
};