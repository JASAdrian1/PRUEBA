import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  Collapse,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  FolderOpen,
  Assessment,
  People,
  Person,
  ExitToApp,
  ChevronLeft,
  ChevronRight,
  Notifications,
  Search,
  Fingerprint,
  Shield,
  ExpandLess,
  ExpandMore,
  Assignment,
  Science,
  Settings,
  Gavel,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const MainLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState('');

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const handleExpandClick = (menu) => {
    setExpandedMenu(expandedMenu === menu ? '' : menu);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      color: theme.palette.primary.main,
      roles: ['Tecnico', 'Coordinador', 'Administrador'],
    },
    {
      text: 'Expedientes',
      icon: <FolderOpen />,
      path: '/expedientes',
      color: theme.palette.info.main,
      roles: ['Tecnico', 'Coordinador', 'Administrador'],
      children: [
        {
          text: 'Todos los Expedientes',
          path: '/expedientes',
          icon: <Assignment />,
        },
        {
          text: 'Nuevo Expediente',
          path: '/expedientes/nuevo',
          icon: <ChevronRight />,
          roles: ['Tecnico', 'Administrador'],
        },
      ],
    },
    {
      text: 'Indicios',
      icon: <Science />,
      path: '/indicios',
      color: theme.palette.warning.main,
      roles: ['Tecnico', 'Coordinador', 'Administrador'],
    },
    {
      text: 'Reportes',
      icon: <Assessment />,
      path: '/reportes',
      color: theme.palette.success.main,
      roles: ['Coordinador', 'Administrador'],
    },
    {
      text: 'Usuarios',
      icon: <People />,
      path: '/usuarios',
      color: theme.palette.secondary.main,
      roles: ['Administrador'],
    },
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrador':
        return theme.palette.error.main;
      case 'Coordinador':
        return theme.palette.warning.main;
      case 'Tecnico':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? drawerWidth : 60}px)`,
          ml: `${open ? drawerWidth : 60}px`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          background: 'white',
          color: theme.palette.text.primary,
          boxShadow: '0 2px 10px rgba(27,79,114,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/dashboard' && 'Panel de Control'}
            {location.pathname === '/expedientes' && 'Gestión de Expedientes'}
            {location.pathname === '/indicios' && 'Gestión de Indicios'}
            {location.pathname === '/reportes' && 'Reportes y Estadísticas'}
            {location.pathname === '/usuarios' && 'Administración de Usuarios'}
            {location.pathname === '/perfil' && 'Mi Perfil'}
          </Typography>

          <IconButton
            size="large"
            color="inherit"
            onClick={handleNotificationOpen}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={user?.rol}
              size="small"
              sx={{
                backgroundColor: alpha(getRoleColor(user?.rol), 0.1),
                color: getRoleColor(user?.rol),
                fontWeight: 600,
              }}
            />
            
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar
                sx={{
                  width: 35,
                  height: 35,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                }}
              >
                {user?.nombre?.[0]}{user?.apellido?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 60,
            boxSizing: 'border-box',
            background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: [1],
            py: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.3s',
            }}
          >
            <Box
              sx={{
                width: 45,
                height: 45,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Fingerprint sx={{ fontSize: 28 }} />
            </Box>
            {open && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  DICRI
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Sistema de Evidencias
                </Typography>
              </Box>
            )}
          </Box>
        </Toolbar>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <List sx={{ px: 1, py: 2 }}>
          {menuItems
            .filter(item => hasRole(item.roles))
            .map((item) => (
              <React.Fragment key={item.text}>
                <ListItemButton
                  onClick={() => {
                    if (item.children) {
                      handleExpandClick(item.text);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '70%',
                        backgroundColor: 'white',
                        borderRadius: '0 4px 4px 0',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'white',
                      minWidth: open ? 40 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <Badge
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: item.color,
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  </ListItemIcon>
                  {open && (
                    <>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: location.pathname === item.path ? 600 : 500,
                        }}
                      />
                      {item.children && (
                        expandedMenu === item.text ? <ExpandLess /> : <ExpandMore />
                      )}
                    </>
                  )}
                </ListItemButton>

                {item.children && (
                  <Collapse in={expandedMenu === item.text && open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children
                        .filter(child => !child.roles || hasRole(child.roles))
                        .map((child) => (
                          <ListItemButton
                            key={child.text}
                            sx={{ pl: 4, borderRadius: 2, mb: 0.5 }}
                            onClick={() => navigate(child.path)}
                            selected={location.pathname === child.path}
                          >
                            <ListItemIcon sx={{ color: 'white', minWidth: 30 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.text}
                              primaryTypographyProps={{
                                fontSize: '0.85rem',
                              }}
                            />
                          </ListItemButton>
                        ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <List sx={{ px: 1, pb: 2 }}>
          <ListItemButton
            onClick={() => navigate('/perfil')}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'white',
                minWidth: open ? 40 : 'auto',
                justifyContent: 'center',
              }}
            >
              <Settings />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Configuración"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                }}
              />
            )}
          </ListItemButton>
        </List>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.nombre} {user?.apellido}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { navigate('/perfil'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 320,
            maxHeight: 400,
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notificaciones
          </Typography>
        </Box>
        <Divider />
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">Nuevo expediente asignado</Typography>
            <Typography variant="caption" color="text.secondary">
              Hace 5 minutos
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">Expediente aprobado</Typography>
            <Typography variant="caption" color="text.secondary">
              Hace 1 hora
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">Revisión pendiente</Typography>
            <Typography variant="caption" color="text.secondary">
              Hace 2 horas
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : 60}px)`,
          marginTop: '64px',
          backgroundColor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
