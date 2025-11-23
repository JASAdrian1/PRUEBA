import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  Fade,
  Grow,
  Slide
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Shield,
  Gavel,
  Fingerprint,
  Security
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { keyframes } from '@mui/system';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(-2deg); }
  66% { transform: translateY(5px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const slideInFromRight = keyframes`
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Login = () => {
  const theme = useTheme();
  const { login, authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Usuario es requerido')
      .min(3, 'Usuario debe tener mínimo 3 caracteres'),
    password: Yup.string()
      .required('Contraseña es requerida')
      .min(6, 'Contraseña debe tener mínimo 6 caracteres'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await login(values.username, values.password);
      if (!result.success) {
        setIsLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          animation: `${float} 6s ease-in-out infinite`,
          opacity: 0.1,
        }}
      >
        <Shield sx={{ fontSize: 120, color: 'white' }} />
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          animation: `${float} 8s ease-in-out infinite`,
          animationDelay: '1s',
          opacity: 0.1,
        }}
      >
        <Gavel sx={{ fontSize: 100, color: 'white' }} />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '5%',
          animation: `${float} 7s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.1,
        }}
      >
        <Security sx={{ fontSize: 80, color: 'white' }} />
      </Box>

      {/* Floating circles */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            borderRadius: '50%',
            background: alpha(theme.palette.common.white, 0.03),
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `${pulse} ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <Grow in={mounted} timeout={1000}>
        <Card
          elevation={24}
          sx={{
            width: { xs: '90%', sm: 450 },
            p: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '16px 16px 0 0',
            },
          }}
        >
          {/* Logo Section */}
          <Fade in={mounted} timeout={1500}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(27,79,114,0.3)',
                  mb: 2,
                  transform: 'rotate(-5deg)',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                  },
                }}
              >
                <Fingerprint sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                DICRI
              </Typography>
              
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
              >
                Sistema de Gestión de Evidencias
              </Typography>
              
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.disabled,
                  display: 'block',
                  mt: 1,
                }}
              >
                Ministerio Público de Guatemala
              </Typography>
            </Box>
          </Fade>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              ACCESO SEGURO
            </Typography>
          </Divider>

          {authError && (
            <Slide direction="down" in={true} mountOnEnter unmountOnExit>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  animation: `${slideInFromRight} 0.5s ease-out`,
                }}
              >
                {authError}
              </Alert>
            </Slide>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Fade in={mounted} timeout={2000}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Usuario"
                variant="outlined"
                margin="normal"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                    },
                  },
                }}
              />
            </Fade>

            <Fade in={mounted} timeout={2500}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                    },
                  },
                }}
              />
            </Fade>

            <Fade in={mounted} timeout={3000}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading || !formik.isValid}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: '0 4px 15px rgba(27,79,114,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(27,79,114,0.4)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'INICIAR SESIÓN'
                )}
              </Button>
            </Fade>
          </form>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 DICRI - Todos los derechos reservados
            </Typography>
          </Box>

          {/* Security Badge */}
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: -20,
              right: 20,
              px: 2,
              py: 1,
              borderRadius: 20,
              background: theme.palette.secondary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Shield sx={{ fontSize: 16, color: 'white' }} />
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
              CONEXIÓN SEGURA
            </Typography>
          </Paper>
        </Card>
      </Grow>
    </Box>
  );
};

export default Login;
