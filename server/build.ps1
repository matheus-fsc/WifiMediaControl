# Build script para criar executável do AudioRemote Server
# Certifique-se de ter o PyInstaller instalado: pip install pyinstaller

Write-Host "🔨 Iniciando build do AudioRemote Server..." -ForegroundColor Green

# Ativa o ambiente virtual
& ..\.venv\Scripts\Activate.ps1

# Instala PyInstaller se necessário
Write-Host "📦 Verificando PyInstaller..." -ForegroundColor Cyan
pip install pyinstaller

# Cria o executável
Write-Host "🚀 Compilando server_gui.py..." -ForegroundColor Cyan
pyinstaller --onefile `
    --windowed `
    --name "AudioRemote-Server" `
    --icon=assets/icon.png `
    --add-data "assets;assets" `
    --hidden-import=pycaw.pycaw `
    --hidden-import=comtypes `
    --hidden-import=pynput `
    --hidden-import=PIL `
    server_gui.py

Write-Host ""
Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host "📁 O executável está em: dist\AudioRemote-Server.exe" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para testar: .\dist\AudioRemote-Server.exe" -ForegroundColor Cyan
