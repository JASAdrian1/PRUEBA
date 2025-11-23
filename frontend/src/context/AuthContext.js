import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Add token to requests if it exists
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/auth/verify');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setAuthError(null);
      setLoading(true);
      
      const response = await axios.post('/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        
        enqueueSnackbar(`Bienvenido ${user.nombre} ${user.apellido}`, { 
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          }
        });
        
        navigate('/dashboard');
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      setAuthError(errorMessage);
      
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        }
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    enqueueSnackbar('Sesión cerrada exitosamente', { 
      variant: 'info',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      }
    });
    navigate('/login');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.rol);
    }
    return user.rol === role;
  };

  const canEdit = () => {
    return hasRole(['Tecnico', 'Administrador']);
  };

  const canApprove = () => {
    return hasRole(['Coordinador', 'Administrador']);
  };

  const isAdmin = () => {
    return hasRole('Administrador');
  };

  // Response interceptor to handle 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          setUser(null);
          navigate('/login');
          enqueueSnackbar('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', { 
            variant: 'warning',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            }
          });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, enqueueSnackbar]);

  const value = {
    user,
    loading,
    authError,
    login,
    logout,
    updateUser,
    hasRole,
    canEdit,
    canApprove,
    isAdmin,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
