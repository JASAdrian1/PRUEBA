-- =============================================
-- Stored Procedures for Indicio Management
-- =============================================
USE DICRI_DB;
GO

-- =============================================
-- sp_GetIndiciosByExpediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetIndiciosByExpediente
    @ExpedienteID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        i.IndicioID,
        i.ExpedienteID,
        i.TipoIndicio,
        i.Descripcion,
        i.Color,
        i.Tamaño,
        i.Peso,
        i.UnidadPeso,
        i.UbicacionHallazgo,
        i.CadenaCustomdia,
        i.TecnicoRegistroID,
        u.Nombre + ' ' + u.Apellido AS TecnicoNombre,
        i.FechaRegistro,
        i.FechaModificacion,
        i.Observaciones,
        i.Activo
    FROM Indicios i
    INNER JOIN Usuarios u ON i.TecnicoRegistroID = u.UsuarioID
    WHERE i.ExpedienteID = @ExpedienteID AND i.Activo = 1
    ORDER BY i.FechaRegistro DESC;
END
GO

-- =============================================
-- sp_GetIndicioById
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetIndicioById
    @IndicioID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        i.IndicioID,
        i.ExpedienteID,
        i.TipoIndicio,
        i.Descripcion,
        i.Color,
        i.Tamaño,
        i.Peso,
        i.UnidadPeso,
        i.UbicacionHallazgo,
        i.CadenaCustomdia,
        i.TecnicoRegistroID,
        u.Nombre + ' ' + u.Apellido AS TecnicoNombre,
        i.FechaRegistro,
        i.FechaModificacion,
        i.Observaciones,
        i.Activo,
        e.NumeroExpediente,
        e.Estado AS EstadoExpediente
    FROM Indicios i
    INNER JOIN Usuarios u ON i.TecnicoRegistroID = u.UsuarioID
    INNER JOIN Expedientes e ON i.ExpedienteID = e.ExpedienteID
    WHERE i.IndicioID = @IndicioID;
END
GO

-- =============================================
-- sp_CreateIndicio
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateIndicio
    @ExpedienteID INT,
    @TipoIndicio NVARCHAR(100),
    @Descripcion NVARCHAR(500),
    @UbicacionHallazgo NVARCHAR(200),
    @Color NVARCHAR(50) = NULL,
    @Tamaño NVARCHAR(100) = NULL,
    @Peso DECIMAL(10, 3) = NULL,
    @UnidadPeso NVARCHAR(10) = NULL,
    @CadenaCustomdia NVARCHAR(100) = NULL,
    @Observaciones NVARCHAR(500) = NULL,
    @TecnicoRegistroID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if expediente exists and is editable
        DECLARE @EstadoExpediente NVARCHAR(20);
        SELECT @EstadoExpediente = Estado 
        FROM Expedientes 
        WHERE ExpedienteID = @ExpedienteID;
        
        IF @EstadoExpediente IS NULL
        BEGIN
            THROW 50010, 'Expediente no encontrado', 1;
        END
        
        IF @EstadoExpediente NOT IN ('Pendiente', 'Rechazado')
        BEGIN
            THROW 50011, 'No se pueden agregar indicios al expediente en su estado actual', 1;
        END
        
        -- Generate chain of custody if not provided
        IF @CadenaCustomdia IS NULL
        BEGIN
            SET @CadenaCustomdia = 'IND-' + CAST(@ExpedienteID AS NVARCHAR) + '-' + 
                                   FORMAT(GETDATE(), 'yyyyMMdd') + '-' + 
                                   RIGHT('000' + CAST((SELECT COUNT(*) + 1 FROM Indicios WHERE ExpedienteID = @ExpedienteID) AS NVARCHAR), 3);
        END
        
        -- Insert new indicio
        INSERT INTO Indicios (
            ExpedienteID,
            TipoIndicio,
            Descripcion,
            Color,
            Tamaño,
            Peso,
            UnidadPeso,
            UbicacionHallazgo,
            CadenaCustomdia,
            TecnicoRegistroID,
            Observaciones
        )
        VALUES (
            @ExpedienteID,
            @TipoIndicio,
            @Descripcion,
            @Color,
            @Tamaño,
            @Peso,
            @UnidadPeso,
            @UbicacionHallazgo,
            @CadenaCustomdia,
            @TecnicoRegistroID,
            @Observaciones
        );
        
        DECLARE @NewIndicioID INT = SCOPE_IDENTITY();
        
        -- Add to history
        INSERT INTO HistorialExpedientes (
            ExpedienteID, 
            UsuarioID, 
            Accion, 
            Comentario
        )
        VALUES (
            @ExpedienteID, 
            @TecnicoRegistroID, 
            'Registro de Indicio', 
            'Nuevo indicio registrado: ' + @TipoIndicio
        );
        
        -- Return the new indicio
        SELECT @NewIndicioID AS IndicioID, @CadenaCustomdia AS CadenaCustomdia;
        
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
-- sp_UpdateIndicio
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateIndicio
    @IndicioID INT,
    @Descripcion NVARCHAR(500) = NULL,
    @UbicacionHallazgo NVARCHAR(200) = NULL,
    @Color NVARCHAR(50) = NULL,
    @Tamaño NVARCHAR(100) = NULL,
    @Peso DECIMAL(10, 3) = NULL,
    @UnidadPeso NVARCHAR(10) = NULL,
    @Observaciones NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if indicio exists and is editable
        DECLARE @ExpedienteID INT;
        DECLARE @EstadoExpediente NVARCHAR(20);
        
        SELECT 
            @ExpedienteID = i.ExpedienteID,
            @EstadoExpediente = e.Estado
        FROM Indicios i
        INNER JOIN Expedientes e ON i.ExpedienteID = e.ExpedienteID
        WHERE i.IndicioID = @IndicioID AND i.Activo = 1;
        
        IF @ExpedienteID IS NULL
        BEGIN
            THROW 50012, 'Indicio no encontrado', 1;
        END
        
        IF @EstadoExpediente NOT IN ('Pendiente', 'Rechazado')
        BEGIN
            THROW 50013, 'No se puede editar el indicio en el estado actual del expediente', 1;
        END
        
        -- Update indicio
        UPDATE Indicios
        SET 
            Descripcion = ISNULL(@Descripcion, Descripcion),
            UbicacionHallazgo = ISNULL(@UbicacionHallazgo, UbicacionHallazgo),
            Color = CASE WHEN @Color = '' THEN NULL ELSE ISNULL(@Color, Color) END,
            Tamaño = CASE WHEN @Tamaño = '' THEN NULL ELSE ISNULL(@Tamaño, Tamaño) END,
            Peso = @Peso,
            UnidadPeso = CASE WHEN @Peso IS NULL THEN NULL ELSE ISNULL(@UnidadPeso, UnidadPeso) END,
            Observaciones = CASE WHEN @Observaciones = '' THEN NULL ELSE ISNULL(@Observaciones, Observaciones) END,
            FechaModificacion = GETDATE()
        WHERE IndicioID = @IndicioID;
        
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
-- sp_DeleteIndicio
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeleteIndicio
    @IndicioID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if indicio exists and is deletable
        DECLARE @ExpedienteID INT;
        DECLARE @EstadoExpediente NVARCHAR(20);
        DECLARE @TecnicoID INT;
        
        SELECT 
            @ExpedienteID = i.ExpedienteID,
            @EstadoExpediente = e.Estado,
            @TecnicoID = i.TecnicoRegistroID
        FROM Indicios i
        INNER JOIN Expedientes e ON i.ExpedienteID = e.ExpedienteID
        WHERE i.IndicioID = @IndicioID AND i.Activo = 1;
        
        IF @ExpedienteID IS NULL
        BEGIN
            THROW 50014, 'Indicio no encontrado', 1;
        END
        
        IF @EstadoExpediente NOT IN ('Pendiente', 'Rechazado')
        BEGIN
            THROW 50015, 'No se puede eliminar el indicio en el estado actual del expediente', 1;
        END
        
        -- Soft delete indicio
        UPDATE Indicios
        SET 
            Activo = 0,
            FechaModificacion = GETDATE()
        WHERE IndicioID = @IndicioID;
        
        -- Add to history
        INSERT INTO HistorialExpedientes (
            ExpedienteID, 
            UsuarioID, 
            Accion, 
            Comentario
        )
        VALUES (
            @ExpedienteID, 
            @TecnicoID, 
            'Eliminación de Indicio', 
            'Indicio eliminado: ID ' + CAST(@IndicioID AS NVARCHAR)
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
