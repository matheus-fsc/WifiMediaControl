# Deploy Guide - AudioRemote Server

## Build Local do Executável

### Requisitos
- Python 3.11+
- Ambiente virtual ativado
- Dependências instaladas

### Passos para Build Local

1. **Ativar ambiente virtual:**
```powershell
.\.venv\Scripts\Activate.ps1
```

2. **Compilar executável:**
```powershell
cd server
.\build.ps1
```

3. **Testar executável:**
```powershell
.\dist\AudioRemote-Server.exe
```

O executável estará em: `server/dist/AudioRemote-Server.exe`

---

## Deploy Automático via GitHub Actions

### Configuração Inicial (Já feita)

O projeto já possui GitHub Actions configurado em `.github/workflows/build-release.yml`

### Como Fazer um Release

#### Opção 1: Via Git (Recomendado)

1. **Commit todas as alterações:**
```bash
git add .
git commit -m "Release v2.0.0 - Professional GUI improvements"
```

2. **Push para o GitHub:**
```bash
git push origin main
```

3. **Criar e publicar tag:**
```bash
git tag -a v2.0.0 -m "Release v2.0.0 - Professional GUI with improved layout"
git push origin v2.0.0
```

#### Opção 2: Via GitHub Interface

1. Acesse: `https://github.com/SEU_USUARIO/WifiMediaControl/releases`
2. Clique em **"Draft a new release"**
3. Preencha:
   - **Tag version:** `v2.0.0` (ou próxima versão)
   - **Release title:** `AudioRemote Server v2.0.0`
   - **Description:**
   ```markdown
   ## What's New
   
   - Professional GUI with modern design
   - Improved layout with consistent spacing
   - Better color scheme and visual hierarchy
   - Enhanced user experience
   - Toggle logs functionality
   - Custom token support
   
   ## Download
   
   Download `AudioRemote-Server.exe` and run it on Windows.
   
   ## Requirements
   
   - Windows 10 or later
   - No Python installation needed
   ```
4. Clique em **"Publish release"**

### O que acontece automaticamente:

1. GitHub Actions detecta a tag `v*`
2. Compila o executável Windows
3. Cria o release automaticamente
4. Anexa `AudioRemote-Server.exe` ao release
5. Gera release notes automaticamente

---

## Verificar Build no GitHub

1. Acesse: `https://github.com/SEU_USUARIO/WifiMediaControl/actions`
2. Verifique se o workflow "Build and Release" rodou com sucesso
3. Se houver erro, clique no job para ver os logs

---

## Estrutura de Versionamento

Siga **Semantic Versioning** (semver.org):

- **MAJOR** (v1.0.0 → v2.0.0): Mudanças incompatíveis
- **MINOR** (v2.0.0 → v2.1.0): Novas funcionalidades compatíveis
- **PATCH** (v2.0.0 → v2.0.1): Bug fixes

### Exemplos:

```bash
# Novo recurso importante
git tag -a v2.1.0 -m "Added multi-language support"

# Correção de bug
git tag -a v2.0.1 -m "Fixed token validation bug"

# Mudança grande (breaking change)
git tag -a v3.0.0 -m "Redesigned API endpoints"
```

---

## Troubleshooting

### Build falha no GitHub Actions

**Problema:** `ModuleNotFoundError: No module named 'PIL'`

**Solução:** Verificar `server/requirements-build.txt` contém Pillow:
```
Pillow==12.0.0
```

### Build falha localmente

**Problema:** PyInstaller não encontra módulos

**Solução:**
```powershell
pip install --upgrade -r requirements-build.txt
```

### Executável não abre

**Problema:** Erro ao carregar ícone

**Solução:** Verificar se `server/assets/icon.png` existe

---

## Checklist Pré-Release

- [ ] Testar servidor localmente
- [ ] Testar app mobile conectando ao servidor
- [ ] Compilar executável localmente e testar
- [ ] Atualizar versão no código (`server_gui.py` linha 100+)
- [ ] Atualizar README.md se necessário
- [ ] Commit e push todas as alterações
- [ ] Criar tag com versão correta
- [ ] Aguardar build do GitHub Actions (5-10 min)
- [ ] Testar download do release no GitHub
- [ ] Atualizar README.md com link do release

---

## Distribuição

### Compartilhar com Usuários

1. Link direto do release:
```
https://github.com/SEU_USUARIO/WifiMediaControl/releases/latest
```

2. Download direto do executável:
```
https://github.com/SEU_USUARIO/WifiMediaControl/releases/download/v2.0.0/AudioRemote-Server.exe
```

### Para Spotify/Portfolio

Use o link do release mais estável:
```
https://github.com/SEU_USUARIO/WifiMediaControl/releases/tag/v2.0.0
```

---

## Estatísticas de Download

Visualize downloads em:
```
https://github.com/SEU_USUARIO/WifiMediaControl/releases
```

Cada release mostra:
- Número de downloads do .exe
- Data de publicação
- Commits incluídos

---

## Próximos Passos

1. **Criar v2.0.0 agora:**
```bash
git add .
git commit -m "feat: Professional GUI with improved layout and styling"
git push origin main
git tag -a v2.0.0 -m "Release v2.0.0 - Professional GUI"
git push origin v2.0.0
```

2. **Aguardar 5-10 minutos** para GitHub Actions completar

3. **Verificar release:** `https://github.com/SEU_USUARIO/WifiMediaControl/releases`

4. **Testar download** do executável

5. **Usar link** para portfolio/Spotify contact

---

## Exemplo de Release Notes Profissional

```markdown
# AudioRemote Server v2.0.0

## Highlights

Modern, professional desktop application for wireless media control over local networks.

## New Features

- **Professional GUI Design**
  - Modern color scheme with improved contrast
  - Consistent spacing and layout hierarchy
  - Subtle borders and refined visual elements
  - Better typography with Segoe UI

- **Enhanced User Experience**
  - Larger, more accessible buttons
  - Improved server status indicator
  - Toggleable activity log
  - Better visual feedback on interactions

- **Token Management**
  - Generate random secure tokens
  - Save custom tokens (no minimum length)
  - Quick copy to clipboard

## Technical Improvements

- Optimized window size (600x700, resizable)
- Better color consistency (#1DB954 green theme)
- Active button states with hover effects
- Professional text field styling

## Download

[AudioRemote-Server.exe](https://github.com/SEU_USUARIO/WifiMediaControl/releases/download/v2.0.0/AudioRemote-Server.exe)

**Size:** ~15MB  
**OS:** Windows 10/11  
**No installation required** - just download and run

## Installation

1. Download `AudioRemote-Server.exe`
2. Double-click to run
3. Click "START SERVER"
4. Configure mobile app with displayed IP and token

## Requirements

- Windows 10 or later
- Local network connection
- No Python installation needed

## Documentation

- [README](https://github.com/SEU_USUARIO/WifiMediaControl/blob/main/README.md)
- [Build Guide](https://github.com/SEU_USUARIO/WifiMediaControl/blob/main/server/BUILD.md)

---

**Full Changelog**: https://github.com/SEU_USUARIO/WifiMediaControl/compare/v1.0.0...v2.0.0
```

---

## Contato com Spotify (Quando Pronto)

Aguarde o release v2.0.0 ser publicado, então:

1. Tenha o link pronto:
```
https://github.com/SEU_USUARIO/WifiMediaControl/releases/tag/v2.0.0
```

2. Grave video demo mostrando:
   - Download do release
   - Executar servidor
   - Conectar app mobile
   - Controlar mídia offline (via hotspot)

3. Use este link no LinkedIn/email para Spotify

**Link fica mais profissional com release público!**
