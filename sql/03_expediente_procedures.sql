-- =============================================
-- Stored Procedures for Expediente Management
-- =============================================
USE DICRI_DB;
GO

-- =============================================
-- sp_GetExpedientes
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetExpedientes
    @Estado NVARCHAR(20) = NULL,
    @FechaInicio DATETIME2 = NULL,
    @FechaFin DATETIME2 = NULL,
    @UsuarioID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
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
        ut.Nombre + ' ' + ut.Apellido AS TecnicoNombre,
        uc.Nombre + ' ' + uc.Apellido AS CoordinadorNombre,
        COUNT(i.IndicioID) AS TotalIndicios
    FROM Expedientes e
    INNER JOIN Usuarios ut ON e.TecnicoRegistroID = ut.UsuarioID
    LEFT JOIN Usuarios uc ON e.CoordinadorRevisionID = uc.UsuarioID
    LEFT JOIN Indicios i ON e.ExpedienteID = i.ExpedienteID AND i.Activo = 1
    WHERE 
        (@Estado IS NULL OR e.Estado = @Estado)
        AND (@FechaInicio IS NULL OR e.FechaRegistro >= @FechaInicio)
        AND (@FechaFin IS NULL OR e.FechaRegistro <= @FechaFin)
        AND (@UsuarioID IS NULL OR e.TecnicoRegistroID = @UsuarioID)
    GROUP BY 
        e.ExpedienteID, e.NumeroExpediente, e.Descripcion, e.Ubicacion,
        e.FiscaliaOrigen, e.Estado, e.FechaRegistro, e.FechaEnvioRevision,
        e.FechaRevision, e.JustificacionRechazo,
        ut.Nombre, ut.Apellido, uc.Nombre, uc.Apellido
    ORDER BY e.FechaRegistro DESC;
END
GO

-- =============================================
-- sp_GetExpedienteById
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetExpedienteById
    @ExpedienteID INT
AS
BEGIN
    SET NOCOUNT ON;
    
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
        e.TecnicoRegistroID,
        ut.Nombre + ' ' + ut.Apellido AS TecnicoNombre,
        e.CoordinadorRevisionID,
        uc.Nombre + ' ' + uc.Apellido AS CoordinadorNombre
    FROM Expedientes e
    INNER JOIN Usuarios ut ON e.TecnicoRegistroID = ut.UsuarioID
    LEFT JOIN Usuarios uc ON e.CoordinadorRevisionID = uc.UsuarioID
    WHERE e.ExpedienteID = @ExpedienteID;
END
GO

-- =============================================
-- sp_CreateExpediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateExpediente
    @NumeroExpediente NVARCHAR(50),
    @Descripcion NVARCHAR(500),
    @Ubicacion NVARCHAR(200),
    @FiscaliaOrigen NVARCHAR(200),
    @TecnicoRegistroID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if expediente number already exists
        IF EXISTS (SELECT 1 FROM Expedientes WHERE NumeroExpediente = @NumeroExpediente)
        BEGIN
            THROW 50003, 'El número de expediente ya existe', 1;
        END
        
        -- Insert new expediente
        INSERT INTO Expedientes (
            NumeroExpediente, 
            Descripcion, 
            Ubicacion, 
            FiscaliaOrigen, 
            TecnicoRegistroID,
            Estado
        )
        VALUES (
            @NumeroExpediente, 
            @Descripcion, 
            @Ubicacion, 
            @FiscaliaOrigen, 
            @TecnicoRegistroID,
            'Pendiente'
        );
        
        DECLARE @NewExpedienteID INT = SCOPE_IDENTITY();
        
        -- Add to history
        INSERT INTO HistorialExpedientes (
            ExpedienteID, 
            UsuarioID, 
            Accion, 
            EstadoAnterior, 
            EstadoNuevo, 
            Comentario
        )
        VALUES (
            @NewExpedienteID, 
            @TecnicoRegistroID, 
            'Creación', 
            NULL, 
            'Pendiente', 
            'Expediente creado'
        );
        
        -- Return the new expediente
        SELECT @NewExpedienteID AS ExpedienteID;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- =============================================
-- sp_UpdateExpediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateExpediente
    @ExpedienteID INT,
    @Descripcion NVARCHAR(500) = NULL,
    @Ubicacion NVARCHAR(200) = NULL,
    @FiscaliaOrigen NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if expediente exists and is in editable state
        DECLARE @CurrentEstado NVARCHAR(20);
        SELECT @CurrentEstado = Estado 
        FROM Expedientes 
        WHERE ExpedienteID = @ExpedienteID;
        
        IF @CurrentEstado IS NULL
        BEGIN
            THROW 50004, 'Expediente no encontrado', 1;
        END
        
        IF @CurrentEstado NOT IN ('Pendiente', 'Rechazado')
        BEGIN
            THROW 50005, 'El expediente no se puede editar en su estado actual', 1;
        END
        
        -- Update expediente
        UPDATE Expedientes
        SET 
            Descripcion = ISNULL(@Descripcion, Descripcion),
            Ubicacion = ISNULL(@Ubicacion, Ubicacion),
            FiscaliaOrigen = ISNULL(@FiscaliaOrigen, FiscaliaOrigen)
        WHERE ExpedienteID = @ExpedienteID;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- =============================================
-- sp_SubmitExpedienteForReview
-- =============================================
CREATE OR ALTER PROCEDURE sp_SubmitExpedienteForReview
    @ExpedienteID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if expediente has at least one indicio
        DECLARE @IndiciosCount INT;
        SELECT @IndiciosCount = COUNT(*) 
        FROM Indicios 
        WHERE ExpedienteID = @ExpedienteID AND Activo = 1;
        
        IF @IndiciosCount = 0
        BEGIN
            THROW 50006, 'El expediente debe tener al menos un indicio registrado', 1;
        END
        
        -- Get current state
        DECLARE @CurrentEstado NVARCHAR(20);
        DECLARE @TecnicoID INT;
        SELECT @CurrentEstado = Estado, @TecnicoID = TecnicoRegistroID
        FROM Expedientes 
        WHERE ExpedienteID = @ExpedienteID;
        
        IF @CurrentEstado NOT IN ('Pendiente', 'Rechazado')
        BEGIN
            THROW 50007, 'El expediente no se puede enviar a revisión en su estado actual', 1;
        END
        
        -- Update expediente status
        UPDATE Expedientes
        SET 
            Estado = 'EnRevision',
            FechaEnvioRevision = GETDATE()
        WHERE ExpedienteID = @ExpedienteID;
        
        -- Add to history
        INSERT INTO HistorialExpedientes (
            ExpedienteID, 
            UsuarioID, 
            Accion, 
            EstadoAnterior, 
            EstadoNuevo, 
            Comentario
        )
        VALUES (
            @ExpedienteID, 
            @TecnicoID, 
            'Envío a Revisión', 
            @CurrentEstado, 
            'EnRevision', 
            'Expediente enviado a revisión con ' + CAST(@IndiciosCount AS NVARCHAR) + ' indicios'
        );
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- =============================================
-- sp_ApproveExpediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_ApproveExpediente
    @ExpedienteID INT,
    @CoordinadorID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check current state
        DECLARE @CurrentEstado NVARCHAR(20);
        SELECT @CurrentEstado = Estado 
        FROM Expedientes 
        WHERE ExpedienteID = @ExpedienteID;
        
        IF @CurrentEstado != 'EnRevision'
        BEGIN
            THROW 50008, 'El expediente no está en revisión', 1;
        END
        
        -- Approve expediente
        UPDATE Expedientes
        SET 
            Estado = 'Aprobado',
            CoordinadorRevisionID = @CoordinadorID,
            FechaRevision = GETDATE(),
            JustificacionRechazo = NULL
        WHERE ExpedienteID = @ExpedienteID;
        
        -- Add to history
        INSERT INTO HistorialExpedientes (
            ExpedienteID, 
            UsuarioID, 
            Accion, 
            EstadoAnterior, 
            EstadoNuevo, 
            Comentario
        )
        VALUES (
            @ExpedienteID, 
            @CoordinadorID, 
            'Aprobación', 
            'EnRevision', 
            'Aprobado', 
            'Expediente aprobado por coordinador'
        );
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- =============================================
-- sp_RejectExpediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_RejectExpediente
    @ExpedienteID INT,
    @CoordinadorID INT,
    @JustificacionRechazo NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check current state
        DECLARE @CurrentEstado NVARCHAR(20);
        SELECT @CurrentEstado = Estado 
        FROM Expedientes 
        WHERE ExpedienteID = @ExpedienteID;
        
        IF @CurrentEstado != 'EnRevision'
        BEGIN
            THROW 50009, 'El expediente no está en revisión', 1;
        END
        
        -- Reject expediente
        UPDATE Expedientes
        SET 
            Estado = 'Rechazado',
            CoordinadorRevisionID = @CoordinadorID,
            FechaRevision = GETDATE(),
            JustificacionRechazo = @JustificacionRechazo
        WHERE ExpedienteID = @ExpedienteID;
        
        -- Add to history
        INSERT INTO HistorialExpedientes (
            ExpedienteID, 
            UsuarioID, 
            Accion, 
            EstadoAnterior, 
            EstadoNuevo, 
            Comentario
        )
        VALUES (
            @ExpedienteID, 
            @CoordinadorID, 
            'Rechazo', 
            'EnRevision', 
            'Rechazado', 
            @JustificacionRechazo
        );
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO
