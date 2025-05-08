# 🎧 AudioRemote

Controle remoto de mídia via rede local, usando um aplicativo mobile feito com **Expo** e um servidor local em **Python Flask** que envia comandos de mídia ao computador (Windows).

---

## Funcionalidades

- Play/Pause ⏯
- Próxima música ⏭
- Música anterior ⏮
- Aumentar volume 🔊
- Diminuir volume 🔉
- Configuração do IP do servidor diretamente no app

---

## Tecnologias Utilizadas

### App Mobile (Expo + React Native)
- `expo-router` (para navegação entre telas)
- `react-native` (interface e interação)
- `fetch()` para comunicação HTTP

### Servidor (Python)
- `Flask` (API HTTP)
- `pynput` (simulação de teclas de mídia)

---

## 🚀 Como rodar o projeto

### 🔧 Servidor Python

1. Instale os pacotes:

```bash
pip install flask pynput
```

2. Crie o arquivo `server.py`:

```python
from flask import Flask, request
from pynput.keyboard import Key, Controller

keyboard = Controller()
app = Flask(__name__)

@app.route('/command/<action>', methods=['POST'])
def command(action):
    keymap = {
        "playpause": Key.media_play_pause,
        "next": Key.media_next,
        "prev": Key.media_previous,
        "volup": Key.media_volume_up,
        "voldown": Key.media_volume_down,
    }
    if action in keymap:
        keyboard.press(keymap[action])
        keyboard.release(keymap[action])
        return f"{action} enviado", 200
    return "Comando inválido", 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

3. Execute o servidor:

```bash
python server.py
```

⚠️ **Permita o acesso no firewall do Windows** para conexões de entrada no Python.

---

### 📲 App Expo (Mobile)

1. Instale as dependências:

```bash
npm install
npx expo install expo-router
```

2. Estrutura esperada:

```
/app
  /config.jsx      ← tela de configuração do IP
  /index.jsx       ← tela de controle
/app/_layout.tsx   ← layout do expo-router
```

3. Inicie o app:

```bash
npx expo start
```

4. Escaneie o QR code com o celular conectado na **mesma rede local (Wi-Fi)** do PC.

---

## 📡 Observações

- O celular e o PC devem estar na mesma rede local.
- O servidor funciona offline, ideal para viagens usando hotspot.
- Testado no **Windows 10**, **Android**, e **Expo Go**.

---

## 📘 Licença

Projeto acadêmico individual — Universidade Federal de Itajubá (UNIFEI).
