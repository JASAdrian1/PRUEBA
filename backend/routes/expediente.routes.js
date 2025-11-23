const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { executeStoredProcedure, sql } = require('../config/database');
const { authMiddleware, authMiddlewareMultipleRoles } = require('../middleware/auth.middleware');

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

// Get all expedientes with filters
router.get('/',
  authMiddleware(),
  [
    query('estado').optional().isIn(['Pendiente', 'EnRevision', 'Aprobado', 'Rechazado']),
    query('fechaInicio').optional().isISO8601(),
    query('fechaFin').optional().isISO8601()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { estado, fechaInicio, fechaFin } = req.query;
      
      const result = await executeStoredProcedure('sp_GetExpedientes', {
        Estado: estado || null,
        FechaInicio: fechaInicio || null,
        FechaFin: fechaFin || null,
        UsuarioID: req.user.rol === 'Coordinador' || req.user.rol === 'Administrador' 
          ? null 
          : req.user.id
      });
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Error al obtener expedientes'
        });
      }
      
      res.json({
        success: true,
        data: result.data || []
      });
    } catch (error) {
      console.error('Get expedientes error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener expedientes'
      });
    }
  }
);

// Get single expediente
router.get('/:id',
  authMiddleware(),
  async (req, res) => {
    try {
      const result = await executeStoredProcedure('sp_GetExpedienteById', {
        ExpedienteID: parseInt(req.params.id)
      });
      
      if (!result.success || !result.data || result.data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Expediente no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: result.data[0]
      });
    } catch (error) {
      console.error('Get expediente error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener expediente'
      });
    }
  }
);

// Create new expediente
router.post('/',
  authMiddleware('Tecnico'),
  [
    body('numeroExpediente').notEmpty().withMessage('Número de expediente es requerido'),
    body('descripcion').notEmpty().withMessage('Descripción es requerida'),
    body('ubicacion').notEmpty().withMessage('Ubicación es requerida'),
    body('fiscaliaOrigen').notEmpty().withMessage('Fiscalía de origen es requerida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { numeroExpediente, descripcion, ubicacion, fiscaliaOrigen } = req.body;
      
      const result = await executeStoredProcedure('sp_CreateExpediente', {
        NumeroExpediente: numeroExpediente,
        Descripcion: descripcion,
        Ubicacion: ubicacion,
        FiscaliaOrigen: fiscaliaOrigen,
        TecnicoRegistroID: req.user.id
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Error al crear expediente'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Expediente creado exitosamente',
        data: result.data ? result.data[0] : null
      });
    } catch (error) {
      console.error('Create expediente error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear expediente'
      });
    }
  }
);

// Update expediente
router.put('/:id',
  authMiddleware('Tecnico'),
  [
    body('descripcion').optional().notEmpty(),
    body('ubicacion').optional().notEmpty(),
    body('fiscaliaOrigen').optional().notEmpty()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const expedienteId = parseInt(req.params.id);
      const { descripcion, ubicacion, fiscaliaOrigen } = req.body;
      
      const result = await executeStoredProcedure('sp_UpdateExpediente', {
        ExpedienteID: expedienteId,
        Descripcion: descripcion,
        Ubicacion: ubicacion,
        FiscaliaOrigen: fiscaliaOrigen
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al actualizar expediente'
        });
      }
      
      res.json({
        success: true,
        message: 'Expediente actualizado exitosamente'
      });
    } catch (error) {
      console.error('Update expediente error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar expediente'
      });
    }
  }
);

// Submit expediente for review
router.post('/:id/submit-review',
  authMiddleware('Tecnico'),
  async (req, res) => {
    try {
      const expedienteId = parseInt(req.params.id);
      
      const result = await executeStoredProcedure('sp_SubmitExpedienteForReview', {
        ExpedienteID: expedienteId
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al enviar expediente a revisión'
        });
      }
      
      res.json({
        success: true,
        message: 'Expediente enviado a revisión exitosamente'
      });
    } catch (error) {
      console.error('Submit review error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al enviar expediente a revisión'
      });
    }
  }
);

// Approve expediente
router.post('/:id/approve',
  authMiddleware('Coordinador'),
  async (req, res) => {
    try {
      const expedienteId = parseInt(req.params.id);
      
      const result = await executeStoredProcedure('sp_ApproveExpediente', {
        ExpedienteID: expedienteId,
        CoordinadorID: req.user.id
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al aprobar expediente'
        });
      }
      
      res.json({
        success: true,
        message: 'Expediente aprobado exitosamente'
      });
    } catch (error) {
      console.error('Approve expediente error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al aprobar expediente'
      });
    }
  }
);

// Reject expediente
router.post('/:id/reject',
  authMiddleware('Coordinador'),
  [
    body('justificacion').notEmpty().withMessage('Justificación es requerida para rechazar')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const expedienteId = parseInt(req.params.id);
      const { justificacion } = req.body;
      
      const result = await executeStoredProcedure('sp_RejectExpediente', {
        ExpedienteID: expedienteId,
        CoordinadorID: req.user.id,
        JustificacionRechazo: justificacion
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al rechazar expediente'
        });
      }
      
      res.json({
        success: true,
        message: 'Expediente rechazado'
      });
    } catch (error) {
      console.error('Reject expediente error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al rechazar expediente'
      });
    }
  }
);

module.exports = router;
