const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { executeStoredProcedure, sql } = require('../config/database');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Login endpoint
router.post('/login',
  [
    body('username').notEmpty().withMessage('Usuario es requerido'),
    body('password').notEmpty().withMessage('Contraseña es requerida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Execute stored procedure to get user
      const result = await executeStoredProcedure('sp_GetUsuarioByUsername', {
        Username: username
      });
      
      if (!result.success || !result.data || result.data.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }
      
      const user = result.data[0];
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }
      
      // Check if user is active
      if (!user.Activo) {
        return res.status(401).json({
          success: false,
          error: 'Usuario inactivo'
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.UsuarioID,
          username: user.Username,
          nombre: user.Nombre,
          apellido: user.Apellido,
          rol: user.Rol
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: user.UsuarioID,
          username: user.Username,
          nombre: user.Nombre,
          apellido: user.Apellido,
          email: user.Email,
          rol: user.Rol
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el proceso de autenticación'
      });
    }
  }
);

// Register endpoint (only for admin users)
router.post('/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Usuario debe tener mínimo 3 caracteres'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener mínimo 6 caracteres'),
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('apellido').notEmpty().withMessage('Apellido es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('rol').isIn(['Tecnico', 'Coordinador', 'Administrador']).withMessage('Rol inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, password, nombre, apellido, email, rol } = req.body;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Execute stored procedure to create user
      const result = await executeStoredProcedure('sp_CreateUsuario', {
        Username: username,
        PasswordHash: hashedPassword,
        Nombre: nombre,
        Apellido: apellido,
        Email: email,
        Rol: rol
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Error al crear usuario'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente'
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar usuario'
      });
    }
  }
);

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

module.exports = router;
