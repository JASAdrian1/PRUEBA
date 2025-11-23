import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Expedientes = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Gestión de Expedientes
        </Typography>
        {canEdit() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/expedientes/nuevo')}
          >
            Nuevo Expediente
          </Button>
        )}
      </Box>
      
      <Card>
        <CardContent>
          <Typography variant="body1">
            Módulo de gestión de expedientes DICRI - En desarrollo
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Expedientes;
