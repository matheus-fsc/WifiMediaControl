import os
import secrets
import logging
import socket
import threading
import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
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

TOKEN_FILE = 'server_token.txt'

class AudioRemoteServer:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("AudioRemote Server v2.0")
        self.root.geometry("600x700")
        self.root.resizable(True, True)
        self.root.minsize(600, 650)
        
        # Define ícone da janela
        try:
            icon_path = os.path.join(os.path.dirname(__file__), 'assets', 'icon.png')
            if os.path.exists(icon_path):
                icon = Image.open(icon_path)
                photo = ImageTk.PhotoImage(icon)
                self.root.iconphoto(True, photo)
        except Exception as e:
            logger.warning(f"Não foi possível carregar o ícone: {e}")
        
        self.server_running = False
        self.flask_thread = None
        self.show_logs = tk.BooleanVar(value=True)
        self.token = self.load_or_create_token()
        self.local_ip = self.get_local_ip()
        
        self.setup_ui()
        self.setup_flask()
        
    def load_or_create_token(self):
        """Carrega token existente ou cria um novo"""
        if os.path.exists(TOKEN_FILE):
            with open(TOKEN_FILE, 'r') as f:
                return f.read().strip()
        else:
            token = secrets.token_urlsafe(32)
            with open(TOKEN_FILE, 'w') as f:
                f.write(token)
            return token
    
    def save_token(self, new_token):
        """Salva novo token personalizado"""
        with open(TOKEN_FILE, 'w') as f:
            f.write(new_token)
        self.token = new_token
        global API_TOKEN
        API_TOKEN = new_token
    
    def get_local_ip(self):
        """Obtém o IP local da máquina"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('10.255.255.255', 1))
            local_ip = s.getsockname()[0]
            s.close()
            return local_ip
        except Exception:
            try:
                hostname = socket.gethostname()
                return socket.gethostbyname(hostname)
            except:
                return '127.0.0.1'
    
    def setup_ui(self):
        """Configura a interface gráfica"""
        # Header com título
        header_frame = tk.Frame(self.root, bg="#1DB954", height=80)
        header_frame.pack(fill=tk.X)
        header_frame.pack_propagate(False)
        
        # Título e versão centralizados
        title_container = tk.Frame(header_frame, bg="#1DB954")
        title_container.pack(expand=True, pady=15)
        
        title_label = tk.Label(title_container, text="AudioRemote Server", 
                               font=("Segoe UI", 20, "bold"), bg="#1DB954", fg="white")
        title_label.pack()
        
        version_label = tk.Label(title_container, text="Version 2.0.0", 
                                font=("Segoe UI", 10), bg="#1DB954", fg="#d0f0c0")
        version_label.pack()
        
        # Container principal
        main_frame = tk.Frame(self.root, bg="#f5f5f5", padx=25, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # IP do Servidor
        ip_section = tk.Frame(main_frame, bg="#ffffff", relief=tk.RIDGE, bd=1)
        ip_section.pack(fill=tk.X, pady=(0, 12))
        
        ip_title = tk.Label(ip_section, text="SERVER ADDRESS", 
                           font=("Segoe UI", 9, "bold"), bg="#ffffff", fg="#666666")
        ip_title.pack(anchor="w", padx=15, pady=(12, 5))
        
        ip_value_frame = tk.Frame(ip_section, bg="#ffffff")
        ip_value_frame.pack(fill=tk.X, padx=15, pady=(0, 8))
        
        self.ip_entry = tk.Entry(ip_value_frame, font=("Consolas", 12, "bold"), 
                                fg="#1DB954", relief=tk.FLAT, bg="#f9f9f9", 
                                state="readonly", readonlybackground="#f9f9f9")
        self.ip_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=5, ipadx=8)
        self.ip_entry.insert(0, f"{self.local_ip}:5000")
        
        ip_copy_btn = tk.Button(ip_value_frame, text="Copy", font=("Segoe UI", 9),
                               bg="#1DB954", fg="white", relief=tk.FLAT, cursor="hand2",
                               padx=15, pady=5,
                               command=lambda: self.copy_to_clipboard(f"{self.local_ip}:5000"))
        ip_copy_btn.pack(side=tk.RIGHT, padx=(10, 0))
        
        url_label = tk.Label(ip_section, text=f"http://{self.local_ip}:5000", 
                            font=("Segoe UI", 8), bg="#ffffff", fg="#999999")
        url_label.pack(anchor="w", padx=15, pady=(0, 12))
        
        # Token de Autenticação
        token_section = tk.Frame(main_frame, bg="#ffffff", relief=tk.RIDGE, bd=1)
        token_section.pack(fill=tk.X, pady=(0, 12))
        
        token_title = tk.Label(token_section, text="AUTHENTICATION TOKEN", 
                              font=("Segoe UI", 9, "bold"), bg="#ffffff", fg="#666666")
        token_title.pack(anchor="w", padx=15, pady=(12, 5))
        
        token_value_frame = tk.Frame(token_section, bg="#ffffff")
        token_value_frame.pack(fill=tk.X, padx=15, pady=(0, 8))
        
        self.token_entry = tk.Entry(token_value_frame, font=("Consolas", 10), 
                                    fg="#333333", relief=tk.FLAT, bg="#f9f9f9")
        self.token_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=5, ipadx=8)
        self.token_entry.insert(0, self.token)
        
        token_copy_btn = tk.Button(token_value_frame, text="Copy", font=("Segoe UI", 9),
                                  bg="#1DB954", fg="white", relief=tk.FLAT, cursor="hand2",
                                  padx=15, pady=5,
                                  command=lambda: self.copy_to_clipboard(self.token_entry.get()))
        token_copy_btn.pack(side=tk.RIGHT, padx=(10, 0))
        
        # Botões de token
        token_btn_frame = tk.Frame(token_section, bg="#ffffff")
        token_btn_frame.pack(fill=tk.X, padx=15, pady=(0, 12))
        
        generate_btn = tk.Button(token_btn_frame, text="Generate New", font=("Segoe UI", 9),
                                bg="#4CAF50", fg="white", relief=tk.FLAT, cursor="hand2",
                                padx=12, pady=5, command=self.generate_new_token)
        generate_btn.pack(side=tk.LEFT, padx=(0, 8))
        
        save_btn = tk.Button(token_btn_frame, text="Save Custom", font=("Segoe UI", 9),
                            bg="#2196F3", fg="white", relief=tk.FLAT, cursor="hand2",
                            padx=12, pady=5, command=self.save_custom_token)
        save_btn.pack(side=tk.LEFT)
        
        # Status e Controles
        control_section = tk.Frame(main_frame, bg="#ffffff", relief=tk.RIDGE, bd=1)
        control_section.pack(fill=tk.X, pady=(0, 12))
        
        status_title = tk.Label(control_section, text="SERVER STATUS", 
                               font=("Segoe UI", 9, "bold"), bg="#ffffff", fg="#666666")
        status_title.pack(anchor="w", padx=15, pady=(12, 5))
        
        status_indicator_frame = tk.Frame(control_section, bg="#ffffff")
        status_indicator_frame.pack(fill=tk.X, padx=15, pady=(0, 12))
        
        self.status_dot = tk.Canvas(status_indicator_frame, width=12, height=12, 
                                   bg="#ffffff", highlightthickness=0)
        self.status_dot.pack(side=tk.LEFT, padx=(0, 8))
        self.status_dot.create_oval(2, 2, 10, 10, fill="#dc3545", outline="")
        
        self.status_label = tk.Label(status_indicator_frame, text="Server Stopped", 
                                     font=("Segoe UI", 11), bg="#ffffff", fg="#333333")
        self.status_label.pack(side=tk.LEFT)
        
        # Botões de controle
        btn_frame = tk.Frame(control_section, bg="#ffffff")
        btn_frame.pack(fill=tk.X, padx=15, pady=(0, 12))
        
        self.start_btn = tk.Button(btn_frame, text="START SERVER", 
                                   font=("Segoe UI", 11, "bold"), bg="#1DB954", fg="white",
                                   relief=tk.FLAT, cursor="hand2", height=2,
                                   command=self.start_server)
        self.start_btn.pack(fill=tk.X, pady=(0, 8))
        
        self.stop_btn = tk.Button(btn_frame, text="STOP SERVER", 
                                  font=("Segoe UI", 11, "bold"), bg="#dc3545", fg="white",
                                  relief=tk.FLAT, cursor="hand2", height=2, state=tk.DISABLED,
                                  command=self.stop_server)
        self.stop_btn.pack(fill=tk.X)
        
        # Log de Atividades
        log_section = tk.Frame(main_frame, bg="#ffffff", relief=tk.RIDGE, bd=1)
        log_section.pack(fill=tk.BOTH, expand=True)
        
        log_header = tk.Frame(log_section, bg="#ffffff")
        log_header.pack(fill=tk.X, padx=15, pady=(12, 5))
        
        log_title = tk.Label(log_header, text="ACTIVITY LOG", 
                            font=("Segoe UI", 9, "bold"), bg="#ffffff", fg="#666666")
        log_title.pack(side=tk.LEFT)
        
        log_toggle = tk.Checkbutton(log_header, text="Show Logs", variable=self.show_logs,
                                   font=("Segoe UI", 9), bg="#ffffff", fg="#666666",
                                   activebackground="#ffffff", selectcolor="#ffffff",
                                   command=self.toggle_logs)
        log_toggle.pack(side=tk.RIGHT)
        
        self.log_container = tk.Frame(log_section, bg="#ffffff")
        self.log_container.pack(fill=tk.BOTH, expand=True, padx=15, pady=(0, 12))
        
        self.log_text = tk.Text(self.log_container, height=6, font=("Consolas", 9), 
                               state=tk.DISABLED, bg="#fafafa", relief=tk.FLAT,
                               fg="#333333", wrap=tk.WORD)
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        log_scroll = tk.Scrollbar(self.log_container, command=self.log_text.yview)
        log_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=log_scroll.set)
        
        self.log("Server ready to start")
    
    def setup_flask(self):
        """Configura o app Flask"""
        global app, API_TOKEN, keyboard
        
        API_TOKEN = self.token
        app = Flask(__name__)
        CORS(app)
        keyboard = Controller()
        
        def require_auth(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                auth_header = request.headers.get('Authorization')
                
                if not auth_header:
                    self.log(f"[AUTH ERROR] Request without token from {request.remote_addr}")
                    return jsonify({"error": "Token de autenticação necessário"}), 401
                
                if not auth_header.startswith('Bearer '):
                    self.log(f"[AUTH ERROR] Invalid format from {request.remote_addr}")
                    return jsonify({"error": "Formato de token inválido"}), 401
                
                token = auth_header.replace('Bearer ', '')
                
                if token != API_TOKEN:
                    self.log(f"[AUTH ERROR] Invalid token from {request.remote_addr}")
                    return jsonify({"error": "Token inválido"}), 401
                
                return f(*args, **kwargs)
            return decorated_function
        
        @app.route('/command/<action>', methods=['POST'])
        @require_auth
        def command(action):
            keymap = {
                "playpause": Key.media_play_pause,
                "next": Key.media_next,
                "prev": Key.media_previous,
            }
            
            if action not in keymap:
                self.log(f"[WARNING] Invalid command: {action}")
                return jsonify({"error": "Comando inválido"}), 400
            
            try:
                keyboard.press(keymap[action])
                keyboard.release(keymap[action])
                self.log(f"[MEDIA] {action.upper()} from {request.remote_addr}")
                return f"{action} enviado", 200
            except Exception as e:
                self.log(f"[ERROR] {e}")
                return jsonify({"error": str(e)}), 500
        
        @app.route('/volume', methods=['POST'])
        @require_auth
        def volume():
            data = request.json
            
            if not data or 'level' not in data:
                return jsonify({"error": "Nível de volume não fornecido"}), 400
            
            level = data['level']
            
            if not isinstance(level, (int, float)) or not (0 <= level <= 100):
                return jsonify({"error": "Nível de volume inválido (0-100)"}), 400
            
            try:
                CoInitialize()
                devices = AudioUtilities.GetSpeakers()
                interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
                volume_interface = interface.QueryInterface(IAudioEndpointVolume)
                volume_interface.SetMasterVolumeLevelScalar(level / 100, None)
                self.log(f"[VOLUME] Set to {level}% from {request.remote_addr}")
                return f"Volume ajustado para {level}%", 200
            except Exception as e:
                self.log(f"[ERROR] Volume adjustment failed: {e}")
                return jsonify({"error": f"Erro ao ajustar o volume: {str(e)}"}), 500
            finally:
                CoUninitialize()
        
        @app.route("/ping")
        def ping():
            return "pong", 200
        
        @app.route("/info")
        def info():
            return jsonify({
                "name": "AudioRemote Server",
                "version": "2.0.0",
                "auth_required": True,
                "ip": self.local_ip,
                "port": 5000,
                "url": f"http://{self.local_ip}:5000"
            }), 200
    
    def log(self, message):
        """Adiciona mensagem ao log"""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, f"{message}\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
    
    def toggle_logs(self):
        """Mostra ou oculta a área de logs"""
        if self.show_logs.get():
            self.log_container.pack(fill=tk.BOTH, expand=True, padx=15, pady=(0, 12))
        else:
            self.log_container.pack_forget()
    
    def copy_to_clipboard(self, text):
        """Copia texto para a área de transferência"""
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        messagebox.showinfo("Copiado!", f"'{text}' copiado para a área de transferência!")
    
    def generate_new_token(self):
        """Gera um novo token aleatório"""
        new_token = secrets.token_urlsafe(32)
        self.token_entry.delete(0, tk.END)
        self.token_entry.insert(0, new_token)
        self.save_token(new_token)
        self.log("[TOKEN] New token generated")
        messagebox.showinfo("Token Gerado", "Novo token gerado com sucesso!")
    
    def save_custom_token(self):
        """Salva token personalizado"""
        custom_token = self.token_entry.get().strip()
        if len(custom_token) < 1:
            messagebox.showwarning("Token Inválido", "O token não pode estar vazio!")
            return
        self.save_token(custom_token)
        self.log("[TOKEN] Custom token saved")
        messagebox.showinfo("Token Salvo", "Token personalizado salvo com sucesso!")
    
    def start_server(self):
        """Inicia o servidor Flask"""
        if self.server_running:
            return
        
        self.server_running = True
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.status_label.config(text="Server Running", fg="#28a745")
        self.status_dot.delete("all")
        self.status_dot.create_oval(2, 2, 10, 10, fill="#28a745", outline="")
        
        self.log(f"[SERVER] Started at http://{self.local_ip}:5000")
        
        # Inicia Flask em thread separada
        self.flask_thread = threading.Thread(target=self.run_flask, daemon=True)
        self.flask_thread.start()
    
    def stop_server(self):
        """Para o servidor Flask"""
        if not self.server_running:
            return
        
        # Atualiza status visual
        self.server_running = False
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.status_label.config(text="Server Stopped", fg="#dc3545")
        self.status_dot.delete("all")
        self.status_dot.create_oval(2, 2, 10, 10, fill="#dc3545", outline="")
        
        self.log("[SERVER] Stopping... (Application restart required for full stop)")
        
        # Avisa que é necessário reiniciar
        messagebox.showinfo("Servidor Parado", 
                           "Servidor marcado como parado.\n\n"
                           "Nota: Para parar completamente o Flask, \n"
                           "feche e reabra a aplicação.")
    
    def run_flask(self):
        """Executa o servidor Flask"""
        try:
            app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
        except Exception as e:
            self.log(f"[ERROR] {e}")
            self.server_running = False
            self.start_btn.config(state=tk.NORMAL)
            self.stop_btn.config(state=tk.DISABLED)
            self.status_label.config(text="Server Stopped", fg="#dc3545")
            self.status_dot.delete("all")
            self.status_dot.create_oval(2, 2, 10, 10, fill="#dc3545", outline="")
    
    def run(self):
        """Inicia a aplicação"""
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        self.root.mainloop()
    
    def on_close(self):
        """Fecha a aplicação"""
        if messagebox.askokcancel("Sair", "Deseja realmente fechar o servidor?"):
            self.root.destroy()

if __name__ == "__main__":
    server = AudioRemoteServer()
    server.run()
