import { Config, ApiErrorResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('token');

export const api = {
  auth: {
    login: async (username: string, password: string, role: string) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ username, password, role })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    verify: async () => {
      const token = getToken();
      if (!token) {
        throw new Error('No token found');
      }
      
      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Verification failed');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Verify error:', error);
        throw error;
      }
    }
  },

  config: {
    // Add polling method for config updates
    poll: async (callback: (data: any) => void, interval = 30000) => {
      const pollConfigs = async () => {
        try {
          const data = await api.config.getAll();
          callback(data);
        } catch (error) {
          console.error('Polling error:', error);
        }
      };

      // Initial fetch
      await pollConfigs();
      
      // Set up polling interval
      const timer = setInterval(pollConfigs, interval);
      
      // Return cleanup function
      return () => clearInterval(timer);
    },

    create: async (config: Config) => {
      const token = getToken();
      const response = await fetch(`${API_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create config');
      }

      return response.json();
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
        throw new Error((responseData as ApiErrorResponse).message || 'Failed to update config');
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
    // Add polling method for feedback updates
    pollSummary: async (params: any, callback: (data: any) => void, interval = 30000) => {
      const pollSummary = async () => {
        try {
          const data = await api.feedback.getSummary(params);
          callback(data);
        } catch (error) {
          console.error('Polling error:', error);
        }
      };

      // Initial fetch
      await pollSummary();
      
      // Set up polling interval
      const timer = setInterval(pollSummary, interval);
      
      // Return cleanup function
      return () => clearInterval(timer);
    },

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
