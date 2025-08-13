@echo off 
echo 🚀 Starting Student Portal Full Stack Application...
echo. 

:: check if we are in root directory
if not exist "server\package.json" (
    echo ❌ Error: Please run this script from the root directory of Student_Portal-CLEAN
    pause
    exit /b 1
)

:: start node.js (backend)
echo 🌐 Starting Node.js backend server...
start "Backend Server" cmd /k "cd server && npm run dev"

:: wait for backend to begin
timeout /t 3 /nobreak >nul

:: start react (frontend)
echo ⚛️ Starting React frontend...
start "Frontend" cmd /k "cd client && npm start"

:: wait for frotend to begin
timeout /t 3 /nobreak >nul

:: Start Flask API
echo 🐍 Starting Flask API...
start "Flask API" cmd /k "cd scripts\google-docs && python docs_api.py"

echo.
echo ✅ All services are starting up!
echo.
echo 📊 Backend:    http://localhost:5000
echo ⚛️ Frontend:   http://localhost:3000  
echo 🐍 Flask API:  http://localhost:5001
echo.
echo Press any key to exit...
pause >nul