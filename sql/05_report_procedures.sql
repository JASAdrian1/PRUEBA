-- =============================================
-- Stored Procedures for Reports
-- =============================================
USE DICRI_DB;
GO

-- =============================================
-- sp_GetEstadisticasGenerales
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetEstadisticasGenerales
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        (SELECT COUNT(*) FROM Expedientes) AS TotalExpedientes,
        (SELECT COUNT(*) FROM Expedientes WHERE Estado = 'Pendiente') AS ExpedientesPendientes,
        (SELECT COUNT(*) FROM Expedientes WHERE Estado = 'EnRevision') AS ExpedientesEnRevision,
        (SELECT COUNT(*) FROM Expedientes WHERE Estado = 'Aprobado') AS ExpedientesAprobados,
        (SELECT COUNT(*) FROM Expedientes WHERE Estado = 'Rechazado') AS ExpedientesRechazados,
        (SELECT COUNT(*) FROM Indicios WHERE Activo = 1) AS TotalIndicios,
        (SELECT COUNT(*) FROM Usuarios WHERE Activo = 1) AS UsuariosActivos,
        (SELECT COUNT(*) FROM Usuarios WHERE Rol = 'Tecnico' AND Activo = 1) AS TotalTecnicos,
        (SELECT COUNT(*) FROM Usuarios WHERE Rol = 'Coordinador' AND Activo = 1) AS TotalCoordinadores,
        (SELECT COUNT(*) FROM Expedientes WHERE CAST(FechaRegistro AS DATE) = CAST(GETDATE() AS DATE)) AS ExpedientesHoy,
        (SELECT COUNT(*) FROM Expedientes WHERE FechaRegistro >= DATEADD(DAY, -7, GETDATE())) AS ExpedientesSemana,
        (SELECT COUNT(*) FROM Expedientes WHERE FechaRegistro >= DATEADD(DAY, -30, GETDATE())) AS ExpedientesMes;
END
GO

-- =============================================
-- sp_ReporteExpedientes
-- =============================================
CREATE OR ALTER PROCEDURE sp_ReporteExpedientes
    @FechaInicio DATETIME2 = NULL,
    @FechaFin DATETIME2 = NULL,
    @Estado NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Set default dates if not provided
    IF @FechaInicio IS NULL
        SET @FechaInicio = DATEADD(MONTH, -1, GETDATE());
    
    IF @FechaFin IS NULL
        SET @FechaFin = GETDATE();
    
    SELECT 
        e.ExpedienteID,
        e.NumeroExpediente,
        e.Descripcion,
        e.FiscaliaOrigen,
        e.Estado,
        e.FechaRegistro,
        e.FechaEnvioRevision,
        e.FechaRevision,
        ut.Nombre + ' ' + ut.Apellido AS TecnicoRegistro,
        uc.Nombre + ' ' + uc.Apellido AS CoordinadorRevision,
        COUNT(DISTINCT i.IndicioID) AS CantidadIndicios,
        e.JustificacionRechazo,
        DATEDIFF(HOUR, e.FechaRegistro, 
            COALESCE(e.FechaRevision, e.FechaEnvioRevision, GETDATE())) AS HorasProcesamiento
    FROM Expedientes e
    INNER JOIN Usuarios ut ON e.TecnicoRegistroID = ut.UsuarioID
    LEFT JOIN Usuarios uc ON e.CoordinadorRevisionID = uc.UsuarioID
    LEFT JOIN Indicios i ON e.ExpedienteID = i.ExpedienteID AND i.Activo = 1
    WHERE 
        e.FechaRegistro BETWEEN @FechaInicio AND @FechaFin
        AND (@Estado IS NULL OR e.Estado = @Estado)
    GROUP BY 
        e.ExpedienteID, e.NumeroExpediente, e.Descripcion, e.FiscaliaOrigen,
        e.Estado, e.FechaRegistro, e.FechaEnvioRevision, e.FechaRevision,
        ut.Nombre, ut.Apellido, uc.Nombre, uc.Apellido, e.JustificacionRechazo
    ORDER BY e.FechaRegistro DESC;
END
GO

-- =============================================
-- sp_ReporteIndicios
-- =============================================
CREATE OR ALTER PROCEDURE sp_ReporteIndicios
    @FechaInicio DATETIME2 = NULL,
    @FechaFin DATETIME2 = NULL,
    @TipoIndicio NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Set default dates if not provided
    IF @FechaInicio IS NULL
        SET @FechaInicio = DATEADD(MONTH, -1, GETDATE());
    
    IF @FechaFin IS NULL
        SET @FechaFin = GETDATE();
    
    SELECT 
        i.IndicioID,
        i.TipoIndicio,
        i.Descripcion,
        i.CadenaCustomdia,
        i.UbicacionHallazgo,
        i.Color,
        i.Tamaño,
        CASE 
            WHEN i.Peso IS NOT NULL 
            THEN CAST(i.Peso AS NVARCHAR) + ' ' + i.UnidadPeso
            ELSE NULL
        END AS PesoCompleto,
        i.FechaRegistro,
        e.NumeroExpediente,
        e.FiscaliaOrigen,
        e.Estado AS EstadoExpediente,
        u.Nombre + ' ' + u.Apellido AS TecnicoRegistro,
        i.Observaciones
    FROM Indicios i
    INNER JOIN Expedientes e ON i.ExpedienteID = e.ExpedienteID
    INNER JOIN Usuarios u ON i.TecnicoRegistroID = u.UsuarioID
    WHERE 
        i.FechaRegistro BETWEEN @FechaInicio AND @FechaFin
        AND i.Activo = 1
        AND (@TipoIndicio IS NULL OR i.TipoIndicio = @TipoIndicio)
    ORDER BY i.FechaRegistro DESC;
END
GO

-- =============================================
-- sp_ReporteActividadUsuarios
-- =============================================
CREATE OR ALTER PROCEDURE sp_ReporteActividadUsuarios
    @FechaInicio DATETIME2 = NULL,
    @FechaFin DATETIME2 = NULL,
    @UsuarioID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Set default dates if not provided
    IF @FechaInicio IS NULL
        SET @FechaInicio = DATEADD(MONTH, -1, GETDATE());
    
    IF @FechaFin IS NULL
        SET @FechaFin = GETDATE();
    
    SELECT 
        u.UsuarioID,
        u.Username,
        u.Nombre + ' ' + u.Apellido AS NombreCompleto,
        u.Rol,
        COUNT(DISTINCT e.ExpedienteID) AS ExpedientesRegistrados,
        COUNT(DISTINCT i.IndicioID) AS IndiciosRegistrados,
        COUNT(DISTINCT ea.ExpedienteID) AS ExpedientesAprobados,
        COUNT(DISTINCT er.ExpedienteID) AS ExpedientesRechazados,
        COUNT(DISTINCT h.HistorialID) AS TotalAcciones,
        MAX(h.FechaAccion) AS UltimaActividad
    FROM Usuarios u
    LEFT JOIN Expedientes e ON u.UsuarioID = e.TecnicoRegistroID 
        AND e.FechaRegistro BETWEEN @FechaInicio AND @FechaFin
    LEFT JOIN Indicios i ON u.UsuarioID = i.TecnicoRegistroID 
        AND i.FechaRegistro BETWEEN @FechaInicio AND @FechaFin
        AND i.Activo = 1
    LEFT JOIN Expedientes ea ON u.UsuarioID = ea.CoordinadorRevisionID 
        AND ea.Estado = 'Aprobado'
        AND ea.FechaRevision BETWEEN @FechaInicio AND @FechaFin
    LEFT JOIN Expedientes er ON u.UsuarioID = er.CoordinadorRevisionID 
        AND er.Estado = 'Rechazado'
        AND er.FechaRevision BETWEEN @FechaInicio AND @FechaFin
    LEFT JOIN HistorialExpedientes h ON u.UsuarioID = h.UsuarioID
        AND h.FechaAccion BETWEEN @FechaInicio AND @FechaFin
    WHERE 
        u.Activo = 1
        AND (@UsuarioID IS NULL OR u.UsuarioID = @UsuarioID)
    GROUP BY 
        u.UsuarioID, u.Username, u.Nombre, u.Apellido, u.Rol
    ORDER BY 
        COUNT(DISTINCT h.HistorialID) DESC;
END
GO

-- =============================================
-- sp_ReporteTendenciasMensuales
-- =============================================
CREATE OR ALTER PROCEDURE sp_ReporteTendenciasMensuales
    @Año INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Use current year if not provided
    IF @Año IS NULL
        SET @Año = YEAR(GETDATE());
    
    WITH Meses AS (
        SELECT 1 AS Mes, 'Enero' AS NombreMes UNION ALL
        SELECT 2, 'Febrero' UNION ALL
        SELECT 3, 'Marzo' UNION ALL
        SELECT 4, 'Abril' UNION ALL
        SELECT 5, 'Mayo' UNION ALL
        SELECT 6, 'Junio' UNION ALL
        SELECT 7, 'Julio' UNION ALL
        SELECT 8, 'Agosto' UNION ALL
        SELECT 9, 'Septiembre' UNION ALL
        SELECT 10, 'Octubre' UNION ALL
        SELECT 11, 'Noviembre' UNION ALL
        SELECT 12, 'Diciembre'
    )
    SELECT 
        m.Mes,
        m.NombreMes,
        ISNULL(COUNT(DISTINCT e.ExpedienteID), 0) AS ExpedientesCreados,
        ISNULL(COUNT(DISTINCT CASE WHEN e.Estado = 'Aprobado' THEN e.ExpedienteID END), 0) AS ExpedientesAprobados,
        ISNULL(COUNT(DISTINCT CASE WHEN e.Estado = 'Rechazado' THEN e.ExpedienteID END), 0) AS ExpedientesRechazados,
        ISNULL(COUNT(DISTINCT i.IndicioID), 0) AS IndiciosRegistrados,
        ISNULL(AVG(DATEDIFF(HOUR, e.FechaRegistro, e.FechaRevision)), 0) AS PromedioHorasRevision
    FROM Meses m
    LEFT JOIN Expedientes e ON MONTH(e.FechaRegistro) = m.Mes AND YEAR(e.FechaRegistro) = @Año
    LEFT JOIN Indicios i ON MONTH(i.FechaRegistro) = m.Mes AND YEAR(i.FechaRegistro) = @Año AND i.Activo = 1
    GROUP BY m.Mes, m.NombreMes
    ORDER BY m.Mes;
END
GO

-- =============================================
-- sp_GetHistorialExpediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetHistorialExpediente
    @ExpedienteID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        h.HistorialID,
        h.ExpedienteID,
        h.UsuarioID,
        u.Nombre + ' ' + u.Apellido AS UsuarioNombre,
        u.Rol AS UsuarioRol,
        h.Accion,
        h.EstadoAnterior,
        h.EstadoNuevo,
        h.Comentario,
        h.FechaAccion
    FROM HistorialExpedientes h
    INNER JOIN Usuarios u ON h.UsuarioID = u.UsuarioID
    WHERE h.ExpedienteID = @ExpedienteID
    ORDER BY h.FechaAccion DESC;
END
GO
