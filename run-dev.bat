@echo off
REM Start both backend and frontend services in separate terminal windows

echo.
echo ========================================
echo Starting Apex Services...
echo ========================================
echo.

REM Start backend on a new terminal window
echo Starting Backend (Express) on port 5000...
start cmd /k "cd server && npm run dev"

REM Start frontend on a new terminal window
echo Starting Frontend (Next.js) on port 3000...
start cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Services started in separate windows
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo To stop services, close the terminal windows.
echo.
pause
