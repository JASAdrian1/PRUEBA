import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Paper,
  useTheme,
  alpha,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Fade,
  Grow,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  FolderOpen,
  Assignment,
  Science,
  People,
  CheckCircle,
  Cancel,
  Schedule,
  RateReview,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  Refresh,
  Assessment,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [recentExpedientes, setRecentExpedientes] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      setStatistics({
        TotalExpedientes: 156,
        TotalIndicios: 892,
        ExpedientesEnRevision: 12,
        ExpedientesPendientes: 23,
        ExpedientesAprobados: 98,
        ExpedientesRechazados: 23,
        UsuariosActivos: 45,
        TotalTecnicos: 28,
        TotalCoordinadores: 8
      });
      
      setMonthlyTrends([
        { NombreMes: 'Enero', ExpedientesCreados: 12, IndiciosRegistrados: 45 },
        { NombreMes: 'Febrero', ExpedientesCreados: 18, IndiciosRegistrados: 72 },
        { NombreMes: 'Marzo', ExpedientesCreados: 24, IndiciosRegistrados: 98 },
        { NombreMes: 'Abril', ExpedientesCreados: 20, IndiciosRegistrados: 85 },
        { NombreMes: 'Mayo', ExpedientesCreados: 28, IndiciosRegistrados: 112 },
      ]);
      
      setRecentExpedientes([
        {
          ExpedienteID: 1,
          NumeroExpediente: 'EXP-2024-001',
          Descripcion: 'Caso de robo agravado en zona 10',
          Estado: 'EnRevision',
          FechaRegistro: new Date()
        },
        {
          ExpedienteID: 2,
          NumeroExpediente: 'EXP-2024-002',
          Descripcion: 'Investigación de homicidio',
          Estado: 'Pendiente',
          FechaRegistro: new Date()
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      enqueueSnackbar('Error al cargar datos del dashboard', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, delay }) => (
    <Grow in={mounted} timeout={1000 + delay}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          borderTop: `4px solid ${color}`,
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography color="textSecondary" gutterBottom variant="overline">
                {title}
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, color }}>
                {loading ? '...' : value}
              </Typography>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {trend > 0 ? (
                    <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                  ) : (
                    <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
                      ml: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    {Math.abs(trend)}% vs mes anterior
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );

  const pieData = statistics ? [
    { name: 'Aprobados', value: statistics.ExpedientesAprobados, color: theme.palette.success.main },
    { name: 'Rechazados', value: statistics.ExpedientesRechazados, color: theme.palette.error.main },
    { name: 'En Revisión', value: statistics.ExpedientesEnRevision, color: theme.palette.warning.main },
    { name: 'Pendientes', value: statistics.ExpedientesPendientes, color: theme.palette.info.main },
  ] : [];

  const getStatusChip = (status) => {
    const statusConfig = {
      Pendiente: { color: 'info', icon: <Schedule /> },
      EnRevision: { color: 'warning', icon: <RateReview /> },
      Aprobado: { color: 'success', icon: <CheckCircle /> },
      Rechazado: { color: 'error', icon: <Cancel /> },
    };

    const config = statusConfig[status] || statusConfig.Pendiente;

    return (
      <Chip
        label={status}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Bienvenido, {user?.nombre} {user?.apellido}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Expedientes"
            value={statistics?.TotalExpedientes || 0}
            icon={<FolderOpen />}
            color={theme.palette.primary.main}
            trend={12}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Indicios Registrados"
            value={statistics?.TotalIndicios || 0}
            icon={<Science />}
            color={theme.palette.warning.main}
            trend={8}
            delay={100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En Revisión"
            value={statistics?.ExpedientesEnRevision || 0}
            icon={<RateReview />}
            color={theme.palette.info.main}
            trend={-5}
            delay={200}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuarios Activos"
            value={statistics?.UsuariosActivos || 0}
            icon={<People />}
            color={theme.palette.success.main}
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Panel de Control - Sistema DICRI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estadísticas y métricas del sistema de gestión de evidencias
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
