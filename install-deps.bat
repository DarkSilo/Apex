@echo off
REM Install dependencies for Apex Sports Club Management System

echo.
echo ========================================
echo Installing Backend Dependencies...
echo ========================================
cd server
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully.
cd ..

echo.
echo ========================================
echo Installing Frontend Dependencies...
echo ========================================
cd client
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully.
cd ..

echo.
echo ========================================
echo All dependencies installed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Configure environment variables:
echo    - server\.env (MongoDB Atlas URI)
echo    - client\.env.local
echo.
echo 2. Run 'run-dev.bat' to start both services
echo.
pause
