import subprocess
import ctypes
import os
import sys
from flask import Flask, request
from flask_cors import CORS
from pynput.keyboard import Key, Controller
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
from comtypes import CLSCTX_ALL, CoInitialize, CoUninitialize

# Verifica se está sendo executado como admin
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

# Reexecuta com privilégios elevados
def run_as_admin():
    if not is_admin() and not os.environ.get("ELEVATED", ""):
        params = f'"{sys.executable}" "{os.path.abspath(__file__)}"'
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, f'"{os.path.abspath(__file__)}"', None, 1)
        sys.exit()

# Libera a porta 5000 no firewall
def liberar_porta_firewall():
    resposta = input("Deseja liberar a porta 5000 no firewall para permitir conexões externas (s/n)? ").strip().lower()
    if resposta == 's':
        try:
            regra_existente = subprocess.run(
                ["powershell", "-Command", "Get-NetFirewallRule -Name 'FlaskServer5000'"],
                capture_output=True, text=True
            )
            if regra_existente.returncode == 0:
                print("✅ Regra de firewall já existe.")
            else:
                subprocess.run([
                    "powershell",
                    "-Command",
                    "New-NetFirewallRule -Name 'FlaskServer5000' -DisplayName 'Allow Flask Server on Port 5000' "
                    "-Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow"
                ], check=True)
                print("✅ Porta 5000 liberada no firewall.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Erro ao liberar a porta: {e}")
    else:
        print("⚠️ A porta 5000 não foi liberada.")

# Eleva o script se necessário
run_as_admin()

# Marca o script como já elevado para evitar loop
os.environ["ELEVATED"] = "1"

# Libera a porta se necessário
liberar_porta_firewall()

# Cria app Flask
app = Flask(__name__)
CORS(app)
keyboard = Controller()

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
        print(f"🎵 Comando executado: {action}")
        return f"{action} enviado", 200
    return "Comando inválido", 400

@app.route('/volume', methods=['POST'])
def volume():
    data = request.json
    if not data or 'level' not in data:
        return "Nível de volume não fornecido", 400
    level = data['level']
    if not (0 <= level <= 100):
        return "Nível de volume inválido", 400
    try:
        CoInitialize()
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume = interface.QueryInterface(IAudioEndpointVolume)
        volume.SetMasterVolumeLevelScalar(level / 100, None)
        return f"Volume ajustado para {level}%", 200
    except Exception as e:
        return f"Erro ao ajustar o volume: {e}", 500
    finally:
        CoUninitialize()

@app.route("/ping")
def ping():
    return "pong", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
