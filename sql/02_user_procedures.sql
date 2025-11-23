-- =============================================
-- Stored Procedures for User Management
-- =============================================
USE DICRI_DB;
GO

-- =============================================
-- sp_GetUsuarioByUsername
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetUsuarioByUsername
    @Username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        UsuarioID,
        Username,
        PasswordHash,
        Nombre,
        Apellido,
        Email,
        Telefono,
        Rol,
        Activo,
        FechaCreacion,
        FechaUltimoAcceso
    FROM Usuarios
    WHERE Username = @Username;
    
    -- Update last access
    UPDATE Usuarios
    SET FechaUltimoAcceso = GETDATE()
    WHERE Username = @Username;
END
GO

-- =============================================
-- sp_GetUsuarioById
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetUsuarioById
    @UsuarioID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        UsuarioID,
        Username,
        PasswordHash,
        Nombre,
        Apellido,
        Email,
        Telefono,
        Rol,
        Activo,
        FechaCreacion,
        FechaUltimoAcceso
    FROM Usuarios
    WHERE UsuarioID = @UsuarioID;
END
GO

-- =============================================
-- sp_CreateUsuario
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateUsuario
    @Username NVARCHAR(50),
    @PasswordHash NVARCHAR(255),
    @Nombre NVARCHAR(100),
    @Apellido NVARCHAR(100),
    @Email NVARCHAR(150),
    @Rol NVARCHAR(20),
    @Telefono NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if username already exists
        IF EXISTS (SELECT 1 FROM Usuarios WHERE Username = @Username)
        BEGIN
            THROW 50001, 'El nombre de usuario ya existe', 1;
        END
        
        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM Usuarios WHERE Email = @Email)
        BEGIN
            THROW 50002, 'El email ya está registrado', 1;
        END
        
        -- Insert new user
        INSERT INTO Usuarios (Username, PasswordHash, Nombre, Apellido, Email, Telefono, Rol)
        VALUES (@Username, @PasswordHash, @Nombre, @Apellido, @Email, @Telefono, @Rol);
        
        SELECT SCOPE_IDENTITY() AS UsuarioID;
        
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
-- sp_UpdateUsuarioProfile
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateUsuarioProfile
    @UsuarioID INT,
    @Nombre NVARCHAR(100) = NULL,
    @Apellido NVARCHAR(100) = NULL,
    @Email NVARCHAR(150) = NULL,
    @Telefono NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if email is already taken by another user
        IF @Email IS NOT NULL AND EXISTS (SELECT 1 FROM Usuarios WHERE Email = @Email AND UsuarioID != @UsuarioID)
        BEGIN
            THROW 50002, 'El email ya está registrado por otro usuario', 1;
        END
        
        -- Update user profile
        UPDATE Usuarios
        SET 
            Nombre = ISNULL(@Nombre, Nombre),
            Apellido = ISNULL(@Apellido, Apellido),
            Email = ISNULL(@Email, Email),
            Telefono = ISNULL(@Telefono, Telefono)
        WHERE UsuarioID = @UsuarioID;
        
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
-- sp_UpdateUsuarioPassword
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateUsuarioPassword
    @UsuarioID INT,
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Usuarios
    SET PasswordHash = @PasswordHash
    WHERE UsuarioID = @UsuarioID;
END
GO

-- =============================================
-- sp_GetAllUsuarios
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetAllUsuarios
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        UsuarioID,
        Username,
        Nombre,
        Apellido,
        Email,
        Telefono,
        Rol,
        Activo,
        FechaCreacion,
        FechaUltimoAcceso
    FROM Usuarios
    ORDER BY Nombre, Apellido;
END
GO

-- =============================================
-- sp_ToggleUsuarioActive
-- =============================================
CREATE OR ALTER PROCEDURE sp_ToggleUsuarioActive
    @UsuarioID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Usuarios
    SET Activo = CASE WHEN Activo = 1 THEN 0 ELSE 1 END
    WHERE UsuarioID = @UsuarioID;
END
GO

-- =============================================
-- sp_UpdateUsuarioRole
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateUsuarioRole
    @UsuarioID INT,
    @Rol NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Usuarios
    SET Rol = @Rol
    WHERE UsuarioID = @UsuarioID;
END
GO
