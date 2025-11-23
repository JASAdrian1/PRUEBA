const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
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

// Get all indicios for an expediente
router.get('/expediente/:expedienteId',
  authMiddleware(),
  [
    param('expedienteId').isInt().withMessage('ID de expediente inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const expedienteId = parseInt(req.params.expedienteId);
      
      const result = await executeStoredProcedure('sp_GetIndiciosByExpediente', {
        ExpedienteID: expedienteId
      });
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Error al obtener indicios'
        });
      }
      
      res.json({
        success: true,
        data: result.data || []
      });
    } catch (error) {
      console.error('Get indicios error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener indicios'
      });
    }
  }
);

// Get single indicio
router.get('/:id',
  authMiddleware(),
  [
    param('id').isInt().withMessage('ID de indicio inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const indicioId = parseInt(req.params.id);
      
      const result = await executeStoredProcedure('sp_GetIndicioById', {
        IndicioID: indicioId
      });
      
      if (!result.success || !result.data || result.data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Indicio no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: result.data[0]
      });
    } catch (error) {
      console.error('Get indicio error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener indicio'
      });
    }
  }
);

// Create new indicio
router.post('/',
  authMiddleware('Tecnico'),
  [
    body('expedienteId').isInt().withMessage('ID de expediente es requerido'),
    body('tipoIndicio').notEmpty().withMessage('Tipo de indicio es requerido'),
    body('descripcion').notEmpty().withMessage('Descripción es requerida'),
    body('ubicacionHallazgo').notEmpty().withMessage('Ubicación del hallazgo es requerida'),
    body('color').optional().isString(),
    body('tamaño').optional().isString(),
    body('peso').optional().isNumeric(),
    body('unidadPeso').optional().isIn(['g', 'kg', 'lb', 'oz']),
    body('cadenaCustomdia').optional().isString(),
    body('observaciones').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        expedienteId,
        tipoIndicio,
        descripcion,
        ubicacionHallazgo,
        color,
        tamaño,
        peso,
        unidadPeso,
        cadenaCustomdia,
        observaciones
      } = req.body;
      
      const result = await executeStoredProcedure('sp_CreateIndicio', {
        ExpedienteID: expedienteId,
        TipoIndicio: tipoIndicio,
        Descripcion: descripcion,
        UbicacionHallazgo: ubicacionHallazgo,
        Color: color || null,
        Tamaño: tamaño || null,
        Peso: peso || null,
        UnidadPeso: unidadPeso || null,
        CadenaCustomdia: cadenaCustomdia || null,
        Observaciones: observaciones || null,
        TecnicoRegistroID: req.user.id
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Error al crear indicio'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Indicio creado exitosamente',
        data: result.data ? result.data[0] : null
      });
    } catch (error) {
      console.error('Create indicio error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear indicio'
      });
    }
  }
);

// Update indicio
router.put('/:id',
  authMiddleware('Tecnico'),
  [
    param('id').isInt().withMessage('ID de indicio inválido'),
    body('descripcion').optional().notEmpty(),
    body('ubicacionHallazgo').optional().notEmpty(),
    body('color').optional().isString(),
    body('tamaño').optional().isString(),
    body('peso').optional().isNumeric(),
    body('unidadPeso').optional().isIn(['g', 'kg', 'lb', 'oz']),
    body('observaciones').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const indicioId = parseInt(req.params.id);
      const {
        descripcion,
        ubicacionHallazgo,
        color,
        tamaño,
        peso,
        unidadPeso,
        observaciones
      } = req.body;
      
      const result = await executeStoredProcedure('sp_UpdateIndicio', {
        IndicioID: indicioId,
        Descripcion: descripcion,
        UbicacionHallazgo: ubicacionHallazgo,
        Color: color,
        Tamaño: tamaño,
        Peso: peso,
        UnidadPeso: unidadPeso,
        Observaciones: observaciones
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al actualizar indicio'
        });
      }
      
      res.json({
        success: true,
        message: 'Indicio actualizado exitosamente'
      });
    } catch (error) {
      console.error('Update indicio error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar indicio'
      });
    }
  }
);

// Delete indicio
router.delete('/:id',
  authMiddleware('Tecnico'),
  [
    param('id').isInt().withMessage('ID de indicio inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const indicioId = parseInt(req.params.id);
      
      const result = await executeStoredProcedure('sp_DeleteIndicio', {
        IndicioID: indicioId
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al eliminar indicio'
        });
      }
      
      res.json({
        success: true,
        message: 'Indicio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Delete indicio error:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar indicio'
      });
    }
  }
);

module.exports = router;
