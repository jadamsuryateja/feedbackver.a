import { Config } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('token');

// Add interface for API error response
interface ApiErrorResponse {
  error: string;
  message?: string;
}

export const api = {
  auth: {
    login: async (username: string, password: string, role: string) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },

    verify: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Verification failed');
      return response.json();
    }
  },

  config: {
    create: async (config: Config) => {
      const response = await fetch(`${API_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(config)
      });

      const responseData = await response.json() as Config | ApiErrorResponse;

      if (!response.ok) {
        const errorMessage = 'error' in responseData 
          ? responseData.error 
          : 'Failed to create configuration';
        throw new Error(errorMessage);
      }

      return responseData as Config;
    },

    getAll: async (params?: any) => {
      const token = getToken();
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      const response = await fetch(`${API_URL}/config${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch configs');
      return response.json();
    },

    getByTitle: async (title: string) => {
      const response = await fetch(`${API_URL}/config/title/${encodeURIComponent(title)}`);
      if (!response.ok) throw new Error('Failed to fetch config');
      return response.json();
    },

    update: async (id: string, config: Config) => {
      const response = await fetch(`${API_URL}/config/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(config)
      });

      const responseData = await response.json() as Config | ApiErrorResponse;

      if (!response.ok) {
        const errorMessage = 'error' in responseData 
          ? responseData.error 
          : 'Failed to update configuration';
        throw new Error(errorMessage);
      }

      return responseData as Config;
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/config/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete config');
      }

      return await response.json();
    }
  },

  feedback: {
    submit: async (data: any) => {
      const response = await fetch(`${API_URL}/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },

    getSummary: async (params: any) => {
      const token = getToken();
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/feedback/summary?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    },

    getResponses: async (params: any) => {
      const token = getToken();
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/feedback/responses?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch responses');
      return response.json();
    }
  }
};

// Remove unused example code at the bottom
