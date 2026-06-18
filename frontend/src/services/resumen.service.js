import api from "./axios.js";

export const resumenService = {
  async getResumen() {
    const response = await api.get("/resumen");
    return response.data;
  }
};