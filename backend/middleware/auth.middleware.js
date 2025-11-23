const jwt = require('jsonwebtoken');

const authMiddleware = (requiredRole = null) => {
  return (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No se proporcionó token de autenticación'
        });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check role if required
      if (requiredRole && decoded.rol !== requiredRole) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para acceder a este recurso'
        });
      }
      
      // Attach user to request
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
  };
};

// Middleware para verificar múltiples roles
const authMiddlewareMultipleRoles = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No se proporcionó token de autenticación'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (roles.length > 0 && !roles.includes(decoded.rol)) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para acceder a este recurso'
        });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }
  };
};

module.exports = {
  authMiddleware,
  authMiddlewareMultipleRoles
};
