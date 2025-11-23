const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { executeStoredProcedure } = require('../config/database');
const { authMiddleware } = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');

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

// Get all users (admin only)
router.get('/',
  authMiddleware('Administrador'),
  async (req, res) => {
    try {
      const result = await executeStoredProcedure('sp_GetAllUsuarios');
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Error al obtener usuarios'
        });
      }
      
      res.json({
        success: true,
        data: result.data || []
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener usuarios'
      });
    }
  }
);

// Get current user profile
router.get('/profile',
  authMiddleware(),
  async (req, res) => {
    try {
      const result = await executeStoredProcedure('sp_GetUsuarioById', {
        UsuarioID: req.user.id
      });
      
      if (!result.success || !result.data || result.data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      const user = result.data[0];
      delete user.PasswordHash; // Remove password hash from response
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener perfil'
      });
    }
  }
);

// Update user profile
router.put('/profile',
  authMiddleware(),
  [
    body('nombre').optional().notEmpty(),
    body('apellido').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('telefono').optional().isMobilePhone()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { nombre, apellido, email, telefono } = req.body;
      
      const result = await executeStoredProcedure('sp_UpdateUsuarioProfile', {
        UsuarioID: req.user.id,
        Nombre: nombre || null,
        Apellido: apellido || null,
        Email: email || null,
        Telefono: telefono || null
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al actualizar perfil'
        });
      }
      
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar perfil'
      });
    }
  }
);

// Change password
router.put('/change-password',
  authMiddleware(),
  [
    body('currentPassword').notEmpty().withMessage('Contraseña actual es requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nueva contraseña debe tener mínimo 6 caracteres')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get current user password
      const userResult = await executeStoredProcedure('sp_GetUsuarioById', {
        UsuarioID: req.user.id
      });
      
      if (!userResult.success || !userResult.data || userResult.data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      const user = userResult.data[0];
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.PasswordHash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Contraseña actual incorrecta'
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      const result = await executeStoredProcedure('sp_UpdateUsuarioPassword', {
        UsuarioID: req.user.id,
        PasswordHash: hashedPassword
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al cambiar contraseña'
        });
      }
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cambiar contraseña'
      });
    }
  }
);

// Toggle user active status (admin only)
router.put('/:id/toggle-active',
  authMiddleware('Administrador'),
  [
    param('id').isInt().withMessage('ID de usuario inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const result = await executeStoredProcedure('sp_ToggleUsuarioActive', {
        UsuarioID: userId
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al cambiar estado del usuario'
        });
      }
      
      res.json({
        success: true,
        message: 'Estado del usuario actualizado'
      });
    } catch (error) {
      console.error('Toggle user active error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cambiar estado del usuario'
      });
    }
  }
);

// Update user role (admin only)
router.put('/:id/role',
  authMiddleware('Administrador'),
  [
    param('id').isInt().withMessage('ID de usuario inválido'),
    body('rol').isIn(['Tecnico', 'Coordinador', 'Administrador']).withMessage('Rol inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { rol } = req.body;
      
      const result = await executeStoredProcedure('sp_UpdateUsuarioRole', {
        UsuarioID: userId,
        Rol: rol
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al actualizar rol del usuario'
        });
      }
      
      res.json({
        success: true,
        message: 'Rol del usuario actualizado'
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar rol del usuario'
      });
    }
  }
);

module.exports = router;
