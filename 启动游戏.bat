@echo off
chcp 65001 >nul
echo ========================================
echo   打工人抗疫日记 - 启动器
echo ========================================
echo.

REM 优先使用 Node.js (最可靠)
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [√] 使用 Node.js 启动服务器
    echo.
    echo 游戏地址: http://localhost:8888
    echo 按 Ctrl+C 停止服务器
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8888
    npx -y http-server -p 8888 --cors
    goto :END
)

REM 备选: PHP
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [√] 使用 PHP 启动服务器
    echo.
    echo 游戏地址: http://localhost:8888
    echo 按 Ctrl+C 停止服务器
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8888
    php -S localhost:8888
    goto :END
)

REM 备选: Python (可能不可用)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [√] 使用 Python 启动服务器
    echo.
    echo 游戏地址: http://localhost:8888
    echo 按 Ctrl+C 停止服务器
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8888
    python -m http.server 8888
    goto :END
)

echo [X] 未检测到 Node.js、PHP 或 Python
echo.
echo 请安装 Node.js: https://nodejs.org/
echo.
pause

:END