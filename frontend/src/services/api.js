import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Backend API URL

const api = {
    async getOrgMetrics() {
        const response = await axios.get(`${API_BASE_URL}/metrics`);
        return response.data;
    },

    async getEnterpriseMetrics() {
        const response = await axios.get(`${API_BASE_URL}/enterprise/metrics`);
        return response.data;
    },

    async getEnterpriseTeamMetrics() {
        const response = await axios.get(`${API_BASE_URL}/enterprise/team/metrics`);
        return response.data;
    },

    async getOrgTeamMetrics() {
        const response = await axios.get(`${API_BASE_URL}/org/team/metrics`);
        return response.data;
    }
};

export default api;
