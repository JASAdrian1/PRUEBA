const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { executeStoredProcedure } = require('../config/database');
const { authMiddleware } = require('../middleware/auth.middleware');

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

// Get general statistics
router.get('/estadisticas',
  authMiddleware(),
  async (req, res) => {
    try {
      const result = await executeStoredProcedure('sp_GetEstadisticasGenerales');
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Error al obtener estadísticas'
        });
      }
      
      res.json({
        success: true,
        data: result.data ? result.data[0] : {}
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  }
);

// Get expedientes report
router.get('/expedientes',
  authMiddleware(),
  [
    query('fechaInicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fechaFin').optional().isISO8601().withMessage('Fecha fin inválida'),
    query('estado').optional().isIn(['Pendiente', 'EnRevision', 'Aprobado', 'Rechazado'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { fechaInicio, fechaFin, estado } = req.query;
      
      const result = await executeStoredProcedure('sp_ReporteExpedientes', {
        FechaInicio: fechaInicio || null,
        FechaFin: fechaFin || null,
        Estado: estado || null
      });
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Error al generar reporte'
        });
      }
      
      res.json({
        success: true,
        data: result.data || []
      });
    } catch (error) {
      console.error('Get expedientes report error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar reporte de expedientes'
      });
    }
  }
);

// Get indicios report
router.get('/indicios',
  authMiddleware(),
  [
    query('fechaInicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fechaFin').optional().isISO8601().withMessage('Fecha fin inválida'),
    query('tipoIndicio').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { fechaInicio, fechaFin, tipoIndicio } = req.query;
      
      const result = await executeStoredProcedure('sp_ReporteIndicios', {
        FechaInicio: fechaInicio || null,
        FechaFin: fechaFin || null,
        TipoIndicio: tipoIndicio || null
      });
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Error al generar reporte'
        });
      }
      
      res.json({
        success: true,
        data: result.data || []
      });
    } catch (error) {
      console.error('Get indicios report error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar reporte de indicios'
      });
    }
  }
);

// Get user activity report
router.get('/actividad-usuarios',
  authMiddleware('Coordinador'),
  [
    query('fechaInicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fechaFin').optional().isISO8601().withMessage('Fecha fin inválida'),
    query('usuarioId').optional().isInt()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { fechaInicio, fechaFin, usuarioId } = req.query;
      
      const result = await executeStoredProcedure('sp_ReporteActividadUsuarios', {
        FechaInicio: fechaInicio || null,
        FechaFin: fechaFin || null,
        UsuarioID: usuarioId ? parseInt(usuarioId) : null
      });
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Error al generar reporte'
        });
      }
      
      res.json({
        success: true,
        data: result.data || []
      });
    } catch (error) {
      console.error('Get user activity report error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar reporte de actividad'
      });
    }
  }
);

// Get monthly trends report
router.get('/tendencias-mensuales',
  authMiddleware(),
  [
    query('año').optional().isInt().withMessage('Año inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const año = req.query.año || new Date().getFullYear();
      
      const result = await executeStoredProcedure('sp_ReporteTendenciasMensuales', {
        Año: parseInt(año)
      });
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Error al generar reporte'
        });
      }
      
      res.json({
        success: true,
        data: result.data || []
      });
    } catch (error) {
      console.error('Get monthly trends error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar reporte de tendencias'
      });
    }
  }
);

module.exports = router;
