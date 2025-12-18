# AudioRemote Server - Build Guide

## 🚀 Como Compilar o Executável

### Pré-requisitos
- Python 3.8 ou superior instalado
- Ambiente virtual configurado

### Passo a Passo

1. **Ative o ambiente virtual:**
```powershell
.\.venv\Scripts\Activate.ps1
```

2. **Instale as dependências de build:**
```powershell
pip install -r requirements-build.txt
```

3. **Execute o script de build:**
```powershell
.\build.ps1
```

### Resultado

O executável será criado em: `dist\AudioRemote-Server.exe`

## 📦 Distribuição

### Arquivos necessários para distribuição:
- `AudioRemote-Server.exe` - Executável principal
- `server_token.txt` - (Opcional) Token pré-configurado

### Como usar o executável:

1. Execute `AudioRemote-Server.exe`
2. A interface gráfica abrirá mostrando:
   - IP do servidor
   - Token de autenticação
   - Controles para iniciar/parar
3. Clique em "Iniciar Servidor"
4. Configure o app mobile com o IP e token mostrados

## 🔧 Customizações do Build

Para modificar as opções de compilação, edite o arquivo `build.ps1`:

- `--onefile`: Cria um único executável
- `--windowed`: Não mostra console (apenas GUI)
- `--name`: Nome do executável
- `--icon`: Ícone do executável
- `--add-data`: Arquivos adicionais incluídos
- `--hidden-import`: Módulos que devem ser incluídos

## 🐛 Troubleshooting

### Erro: "PyInstaller não encontrado"
```powershell
pip install pyinstaller
```

### Erro: "Módulo não encontrado no executável"
Adicione o módulo em `--hidden-import` no `build.ps1`

### Executável muito grande
Use UPX para compressão (não incluído por padrão):
```powershell
pyinstaller --onefile --upx-dir=C:\caminho\para\upx server_gui.py
```

## 📤 Deploy no GitHub

### Preparar Release:

1. **Crie uma tag de versão:**
```bash
git tag -a v2.0.0 -m "AudioRemote Server v2.0.0"
git push origin v2.0.0
```

2. **Compile o executável:**
```powershell
.\build.ps1
```

3. **No GitHub:**
   - Vá em "Releases" → "Create a new release"
   - Selecione a tag criada
   - Título: "AudioRemote Server v2.0.0"
   - Faça upload do arquivo: `dist\AudioRemote-Server.exe`
   - Adicione notas da versão

### Assets para incluir no Release:
- `AudioRemote-Server.exe` - Executável Windows
- `README.md` - Instruções de uso
- `CHANGELOG.md` - Histórico de versões

## 🌐 GitHub Actions (CI/CD Automático)

Crie o arquivo `.github/workflows/build.yml` para build automático em cada release.

Veja exemplo em: `.github/workflows/build-release.yml`
