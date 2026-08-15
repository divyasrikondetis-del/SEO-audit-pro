import api from './api';

export const auditService = {
  create: async (url) => {
    const response = await api.post('/audits', { url });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/audits');
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/audits/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/audits/stats');
    return response.data;
  },

  compare: async (beforeId, afterId) => {
    const response = await api.get(`/audits/compare/${beforeId}/${afterId}`);
    return response.data;
  },
};

export default auditService;
