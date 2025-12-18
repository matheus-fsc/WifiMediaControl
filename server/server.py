import os
import secrets
import logging
import socket
from flask import Flask, request, jsonify
from flask_cors import CORS
from pynput.keyboard import Key, Controller
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
from comtypes import CLSCTX_ALL, CoInitialize, CoUninitialize
from functools import wraps

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Gera ou carrega token de autenticação
TOKEN_FILE = 'server_token.txt'

def load_or_create_token():
    """Carrega token existente ou cria um novo"""
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'r') as f:
            token = f.read().strip()
            logger.info("🔑 Token carregado do arquivo")
            return token
    else:
        token = secrets.token_urlsafe(32)
        with open(TOKEN_FILE, 'w') as f:
            f.write(token)
        logger.info(f"🔑 Novo token gerado e salvo")
        return token

def get_local_ip():
    """Obtém o IP local da máquina"""
    try:
        # Cria um socket UDP para descobrir o IP local
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Não precisa realmente conectar, apenas precisa do binding
        s.connect(('10.255.255.255', 1))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        # Fallback para localhost se não conseguir determinar
        try:
            hostname = socket.gethostname()
            return socket.gethostbyname(hostname)
        except:
            return '127.0.0.1'

API_TOKEN = load_or_create_token()
LOCAL_IP = get_local_ip()

print("\n" + "="*60)
print(f" TOKEN DE AUTENTICAÇÃO:")
print(f"   {API_TOKEN}")
print(f"\n IP DO SERVIDOR:")
print(f"   {LOCAL_IP}:5000")
print(f"\n   Configure este IP e token no app mobile!")
print(f"   URL completa: http://{LOCAL_IP}:5000")
print("="*60 + "\n")

# Cria app Flask
app = Flask(__name__)
CORS(app)
keyboard = Controller()

# Decorator para verificar autenticação
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            logger.warning(f"❌ Requisição sem token de {request.remote_addr}")
            return jsonify({"error": "Token de autenticação necessário"}), 401
        
        if not auth_header.startswith('Bearer '):
            logger.warning(f"❌ Formato de token inválido de {request.remote_addr}")
            return jsonify({"error": "Formato de token inválido"}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        if token != API_TOKEN:
            logger.warning(f"❌ Token inválido de {request.remote_addr}")
            return jsonify({"error": "Token inválido"}), 401
        
        return f(*args, **kwargs)
    return decorated_function


@app.route('/command/<action>', methods=['POST'])
@require_auth
def command(action):
    """Executa comandos de controle de mídia"""
    keymap = {
        "playpause": Key.media_play_pause,
        "next": Key.media_next,
        "prev": Key.media_previous,
    }
    
    if action not in keymap:
        logger.warning(f" Comando inválido: {action}")
        return jsonify({"error": "Comando inválido"}), 400
    
    try:
        keyboard.press(keymap[action])
        keyboard.release(keymap[action])
        logger.info(f"🎵 Comando executado: {action} de {request.remote_addr}")
        return f"{action} enviado", 200
    except Exception as e:
        logger.error(f"❌ Erro ao executar comando {action}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/volume', methods=['POST'])
@require_auth
def volume():
    """Ajusta o volume do sistema"""
    data = request.json
    
    if not data or 'level' not in data:
        logger.warning(" Nível de volume não fornecido")
        return jsonify({"error": "Nível de volume não fornecido"}), 400
    
    level = data['level']
    
    if not isinstance(level, (int, float)) or not (0 <= level <= 100):
        logger.warning(f" Nível de volume inválido: {level}")
        return jsonify({"error": "Nível de volume inválido (0-100)"}), 400
    
    try:
        CoInitialize()
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume_interface = interface.QueryInterface(IAudioEndpointVolume)
        volume_interface.SetMasterVolumeLevelScalar(level / 100, None)
        logger.info(f" Volume ajustado para {level}% de {request.remote_addr}")
        return f"Volume ajustado para {level}%", 200
    except Exception as e:
        logger.error(f"❌ Erro ao ajustar o volume: {e}")
        return jsonify({"error": f"Erro ao ajustar o volume: {str(e)}"}), 500
    finally:
        CoUninitialize()

@app.route("/ping")
def ping():
    """Endpoint para testar conectividade (sem autenticação)"""
    return "pong", 200

@app.route("/info")
def info():
    """Retorna informações do servidor (sem autenticação)"""
    return jsonify({
        "name": "AudioRemote Server",
        "version": "2.0.0",
        "auth_required": True,
        "ip": LOCAL_IP,
        "port": 5000,
        "url": f"http://{LOCAL_IP}:5000"
    }), 200


if __name__ == "__main__":
    logger.info("🚀 Iniciando servidor AudioRemote...")
    logger.info(f"📍 Servidor rodando em http://{LOCAL_IP}:5000")
    logger.info(f"💡 Pressione Ctrl+C para parar o servidor")
    
    try:
        app.run(host="0.0.0.0", port=5000, debug=False)
    except KeyboardInterrupt:
        logger.info("\n👋 Servidor encerrado pelo usuário")
    except Exception as e:
        logger.error(f"❌ Erro ao iniciar servidor: {e}")

