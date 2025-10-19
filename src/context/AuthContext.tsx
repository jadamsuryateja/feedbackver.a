import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { User, LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.auth.verify()
        .then(data => setUser(data.user))
        .catch((error) => {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a helper object with credential information
export const CREDENTIALS = {
  admin: {
    username: 'admin',
    role: 'admin'
  },
  coordinators: {
    cse: { username: 'cse_coord', role: 'coordinator', branch: 'CSE' },
    ece: { username: 'ece_coord', role: 'coordinator', branch: 'ECE' },
    eee: { username: 'eee_coord', role: 'coordinator', branch: 'EEE' },
    mech: { username: 'mech_coord', role: 'coordinator', branch: 'MECH' },
    civil: { username: 'civil_coord', role: 'coordinator', branch: 'CIVIL' },
    ai: { username: 'ai_coord', role: 'coordinator', branch: 'AI' },
    aiml: { username: 'aiml_coord', role: 'coordinator', branch: 'AIML' },
    ds: { username: 'ds_coord', role: 'coordinator', branch: 'DS' },
    cs: { username: 'cs_coord', role: 'coordinator', branch: 'CS' },
    it: { username: 'it_coord', role: 'coordinator', branch: 'IT' },
    mba: { username: 'mba_coord', role: 'coordinator', branch: 'MBA' },
    mca: { username: 'mca_coord', role: 'coordinator', branch: 'MCA' }
  },
  bsh: {
    username: 'bsh_coord',
    role: 'bsh'
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
