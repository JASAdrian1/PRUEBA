-- =============================================
-- Database: DICRI_DB
-- Description: Sistema de Gestión de Evidencias DICRI
-- Version: 1.0
-- =============================================

USE master;
GO

-- Drop database if exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DICRI_DB')
BEGIN
    ALTER DATABASE DICRI_DB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DICRI_DB;
END
GO

-- Create database
CREATE DATABASE DICRI_DB;
GO

USE DICRI_DB;
GO

-- =============================================
-- Table: Usuarios
-- =============================================
CREATE TABLE Usuarios (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) UNIQUE NOT NULL,
    Telefono NVARCHAR(20),
    Rol NVARCHAR(20) NOT NULL CHECK (Rol IN ('Tecnico', 'Coordinador', 'Administrador')),
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    FechaUltimoAcceso DATETIME2,
    INDEX IX_Usuarios_Rol (Rol),
    INDEX IX_Usuarios_Activo (Activo)
);

-- =============================================
-- Table: Expedientes
-- =============================================
CREATE TABLE Expedientes (
    ExpedienteID INT IDENTITY(1,1) PRIMARY KEY,
    NumeroExpediente NVARCHAR(50) UNIQUE NOT NULL,
    Descripcion NVARCHAR(500) NOT NULL,
    Ubicacion NVARCHAR(200) NOT NULL,
    FiscaliaOrigen NVARCHAR(200) NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Pendiente' 
        CHECK (Estado IN ('Pendiente', 'EnRevision', 'Aprobado', 'Rechazado')),
    TecnicoRegistroID INT NOT NULL,
    CoordinadorRevisionID INT,
    FechaRegistro DATETIME2 DEFAULT GETDATE(),
    FechaEnvioRevision DATETIME2,
    FechaRevision DATETIME2,
    JustificacionRechazo NVARCHAR(500),
    FOREIGN KEY (TecnicoRegistroID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (CoordinadorRevisionID) REFERENCES Usuarios(UsuarioID),
    INDEX IX_Expedientes_Estado (Estado),
    INDEX IX_Expedientes_FechaRegistro (FechaRegistro),
    INDEX IX_Expedientes_TecnicoRegistroID (TecnicoRegistroID)
);

-- =============================================
-- Table: Indicios
-- =============================================
CREATE TABLE Indicios (
    IndicioID INT IDENTITY(1,1) PRIMARY KEY,
    ExpedienteID INT NOT NULL,
    TipoIndicio NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(500) NOT NULL,
    Color NVARCHAR(50),
    Tamaño NVARCHAR(100),
    Peso DECIMAL(10, 3),
    UnidadPeso NVARCHAR(10) CHECK (UnidadPeso IN ('g', 'kg', 'lb', 'oz')),
    UbicacionHallazgo NVARCHAR(200) NOT NULL,
    CadenaCustomdia NVARCHAR(100),
    TecnicoRegistroID INT NOT NULL,
    FechaRegistro DATETIME2 DEFAULT GETDATE(),
    FechaModificacion DATETIME2,
    Observaciones NVARCHAR(500),
    Activo BIT DEFAULT 1,
    FOREIGN KEY (ExpedienteID) REFERENCES Expedientes(ExpedienteID),
    FOREIGN KEY (TecnicoRegistroID) REFERENCES Usuarios(UsuarioID),
    INDEX IX_Indicios_ExpedienteID (ExpedienteID),
    INDEX IX_Indicios_TipoIndicio (TipoIndicio),
    INDEX IX_Indicios_FechaRegistro (FechaRegistro)
);

-- =============================================
-- Table: HistorialExpedientes
-- =============================================
CREATE TABLE HistorialExpedientes (
    HistorialID INT IDENTITY(1,1) PRIMARY KEY,
    ExpedienteID INT NOT NULL,
    UsuarioID INT NOT NULL,
    Accion NVARCHAR(50) NOT NULL,
    EstadoAnterior NVARCHAR(20),
    EstadoNuevo NVARCHAR(20),
    Comentario NVARCHAR(500),
    FechaAccion DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ExpedienteID) REFERENCES Expedientes(ExpedienteID),
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    INDEX IX_HistorialExpedientes_ExpedienteID (ExpedienteID),
    INDEX IX_HistorialExpedientes_FechaAccion (FechaAccion)
);

-- =============================================
-- Table: AuditoriaAccesos
-- =============================================
CREATE TABLE AuditoriaAccesos (
    AuditoriaID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    TipoAccion NVARCHAR(50) NOT NULL,
    Descripcion NVARCHAR(200),
    DireccionIP NVARCHAR(45),
    UserAgent NVARCHAR(500),
    FechaAccion DATETIME2 DEFAULT GETDATE(),
    Exitoso BIT DEFAULT 1,
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    INDEX IX_AuditoriaAccesos_UsuarioID (UsuarioID),
    INDEX IX_AuditoriaAccesos_FechaAccion (FechaAccion)
);

-- =============================================
-- Insert initial admin user
-- Password: Admin@123 (should be changed on first login)
-- =============================================
INSERT INTO Usuarios (Username, PasswordHash, Nombre, Apellido, Email, Rol, Activo)
VALUES (
    'admin',
    '$2a$10$YourHashedPasswordHere', -- This should be the bcrypt hash of 'Admin@123'
    'Administrador',
    'Sistema',
    'admin@dicri.mp.gt',
    'Administrador',
    1
);

-- Insert demo users (for testing)
INSERT INTO Usuarios (Username, PasswordHash, Nombre, Apellido, Email, Rol, Activo)
VALUES 
    ('coordinador1', '$2a$10$YourHashedPasswordHere', 'Juan', 'Pérez', 'juan.perez@dicri.mp.gt', 'Coordinador', 1),
    ('tecnico1', '$2a$10$YourHashedPasswordHere', 'María', 'González', 'maria.gonzalez@dicri.mp.gt', 'Tecnico', 1),
    ('tecnico2', '$2a$10$YourHashedPasswordHere', 'Carlos', 'Rodríguez', 'carlos.rodriguez@dicri.mp.gt', 'Tecnico', 1);

GO

-- =============================================
-- Views for reporting
-- =============================================
CREATE VIEW vw_ExpedientesCompletos AS
SELECT 
    e.ExpedienteID,
    e.NumeroExpediente,
    e.Descripcion,
    e.Ubicacion,
    e.FiscaliaOrigen,
    e.Estado,
    e.FechaRegistro,
    e.FechaEnvioRevision,
    e.FechaRevision,
    e.JustificacionRechazo,
    ut.UsuarioID AS TecnicoID,
    ut.Nombre + ' ' + ut.Apellido AS TecnicoNombre,
    uc.UsuarioID AS CoordinadorID,
    uc.Nombre + ' ' + uc.Apellido AS CoordinadorNombre,
    COUNT(i.IndicioID) AS TotalIndicios
FROM Expedientes e
INNER JOIN Usuarios ut ON e.TecnicoRegistroID = ut.UsuarioID
LEFT JOIN Usuarios uc ON e.CoordinadorRevisionID = uc.UsuarioID
LEFT JOIN Indicios i ON e.ExpedienteID = i.ExpedienteID AND i.Activo = 1
GROUP BY 
    e.ExpedienteID, e.NumeroExpediente, e.Descripcion, e.Ubicacion,
    e.FiscaliaOrigen, e.Estado, e.FechaRegistro, e.FechaEnvioRevision,
    e.FechaRevision, e.JustificacionRechazo,
    ut.UsuarioID, ut.Nombre, ut.Apellido,
    uc.UsuarioID, uc.Nombre, uc.Apellido;
GO

CREATE VIEW vw_EstadisticasGenerales AS
SELECT 
    (SELECT COUNT(*) FROM Expedientes) AS TotalExpedientes,
    (SELECT COUNT(*) FROM Expedientes WHERE Estado = 'Pendiente') AS ExpedientesPendientes,
    (SELECT COUNT(*) FROM Expedientes WHERE Estado = 'EnRevision') AS ExpedientesEnRevision,
    (SELECT COUNT(*) FROM Expedientes WHERE Estado = 'Aprobado') AS ExpedientesAprobados,
    (SELECT COUNT(*) FROM Expedientes WHERE Estado = 'Rechazado') AS ExpedientesRechazados,
    (SELECT COUNT(*) FROM Indicios WHERE Activo = 1) AS TotalIndicios,
    (SELECT COUNT(*) FROM Usuarios WHERE Activo = 1) AS UsuariosActivos,
    (SELECT COUNT(*) FROM Usuarios WHERE Rol = 'Tecnico' AND Activo = 1) AS TotalTecnicos,
    (SELECT COUNT(*) FROM Usuarios WHERE Rol = 'Coordinador' AND Activo = 1) AS TotalCoordinadores;
GO
