import api from "./axios.js";

export const historialService = {
  async getBySolicitudId(id) {
    const response = await api.get(`/historial/solicitud/${id}`);
    return response.data;
  }
};