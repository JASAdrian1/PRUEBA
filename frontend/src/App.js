import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';
import esLocale from 'date-fns/locale/es';

// Context
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Theme
import theme from './theme/theme';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expedientes from './pages/Expedientes';
import ExpedienteDetalle from './pages/ExpedienteDetalle';
import Indicios from './pages/Indicios';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';

// Layout
import MainLayout from './components/Layout/MainLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={4000}
        >
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/expedientes" element={<Expedientes />} />
                    <Route path="/expedientes/:id" element={<ExpedienteDetalle />} />
                    <Route path="/indicios" element={<Indicios />} />
                    <Route path="/reportes" element={<Reportes />} />
                    <Route path="/usuarios" element={<Usuarios />} />
                    <Route path="/perfil" element={<Perfil />} />
                  </Route>
                </Route>
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
