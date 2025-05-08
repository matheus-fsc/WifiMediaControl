from flask import Flask, request
from flask_cors import CORS
from pynput.keyboard import Key, Controller
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
from comtypes import CLSCTX_ALL, CoInitialize, CoUninitialize
import os

keyboard = Controller()
app = Flask(__name__)
CORS(app) 

@app.route('/command/<action>', methods=['POST'])
def command(action):
    keymap = {
        "playpause": Key.media_play_pause,
        "next": Key.media_next,
        "prev": Key.media_previous,
    }

    if action in keymap:
        keyboard.press(keymap[action])
        keyboard.release(keymap[action])
        print(f"Comando executado: {action}")
        return f"{action} enviado", 200

    return "Comando inválido", 400

@app.route('/volume', methods=['POST'])
def volume():
    data = request.json
    print(f"Recebido ajuste de volume: {data}")
    if not data or 'level' not in data:
        return "Nível de volume não fornecido", 400

    level = data['level']
    if not (0 <= level <= 100):
        return "Nível de volume inválido", 400

    try:
        # Inicialize o COM
        CoInitialize()
        print("Obtendo dispositivo de áudio padrão...")
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(
            IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume = interface.QueryInterface(IAudioEndpointVolume)
        print(f"Ajustando volume para: {level}%")
        print(f"Volume atual: {volume.GetMasterVolumeLevelScalar() * 100}%")
        volume.SetMasterVolumeLevelScalar(level / 100, None)
        print(f"Novo volume: {volume.GetMasterVolumeLevelScalar() * 100}%")
        print(f"Volume ajustado com sucesso para: {level}%")
        return f"Volume ajustado para {level}%", 200
    except Exception as e:
        print(f"Erro ao ajustar o volume: {e}")
        return "Erro ao ajustar o volume", 500
    finally:
        # Libere o COM
        CoUninitialize()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)