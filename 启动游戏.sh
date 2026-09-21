#!/bin/bash

echo "========================================"
echo "  打工人抗疫日记 - 本地启动器 (Mac/Linux)"
echo "========================================"
echo ""

# 检测Python
if command -v python3 &> /dev/null; then
    echo "[√] 检测到 Python3"
    echo "[*] 正在启动本地服务器..."
    echo ""
    echo "游戏地址: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo ""

    # Mac 自动打开浏览器
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:8000
    fi

    python3 -m http.server 8000
    exit 0
fi

# 检测Node.js
if command -v node &> /dev/null; then
    echo "[√] 检测到 Node.js"
    echo "[*] 正在启动服务器..."
    npx http-server -p 8000 -o
    exit 0
fi

# 检测PHP
if command -v php &> /dev/null; then
    echo "[√] 检测到 PHP"
    echo "[*] 正在启动PHP服务器..."
    echo ""
    echo "游戏地址: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo ""

    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:8000
    fi

    php -S localhost:8000
    exit 0
fi

echo "[X] 未检测到 Python、Node.js 或 PHP"
echo ""
echo "请安装以下任一工具:"
echo "  - Python 3.x: https://www.python.org/downloads/"
echo "  - Node.js: https://nodejs.org/"
echo "  - PHP: https://www.php.net/downloads"
echo ""
echo "或者使用在线部署方案，详见 deploy.html"
