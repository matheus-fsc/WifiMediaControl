# AudioRemote

AudioRemote is a high-performance remote media control application designed for local networks. It bridges the gap between mobile devices and desktop computers, allowing seamless control of media playback, volume, and navigation without requiring physical interaction with the host machine.

The system consists of a robust Python backend (Flask) that interfaces with low-level Windows audio APIs and a modern React Native mobile frontend.

---

## The Story

*"I was on a trip, my iPhone headphones broke, and I only had my laptop and a pair of wired P2 headphones. I needed a way to control my music without constantly opening my laptop in the middle of a bus ride. That is how AudioRemote was born."*

This project was developed to solve a real-world constraint: controlling a PC's audio remotely in an offline environment (like a bus or train) using a personal hotspot, without relying on external internet access.

---

## Key Features

### Mobile Application
- **Play/Pause Control** - Media playback control
- **Next/Previous Track** - Navigation between tracks
- **Volume Control** - Interactive slider for precise volume adjustment
- **Auto-Discovery System** - UDP network scanner automatically identifies server IP
- **Network Type Selection** - Optimized scanning for Wi-Fi, Android Hotspot, or iOS Hotspot
- **Token-Based Authentication** - Bearer token security for authorized access
- **Multi-Language Support** - English/Portuguese-BR with auto-detection
- **Real-Time Connection Status** - Visual indicator with connection state
- **Persistent Configuration** - Settings saved locally using AsyncStorage

### Desktop Server
- **Modern GUI Interface** - Professional tkinter interface
- **Automatic End-User (Windows Executable - Recommended)

1. Download the latest `AudioRemote-Server.exe` from the [Releases page](https://github.com/matheus-fsc/WifiMediaControl/releases)
2. Run the executable on your Windows computer
3. Click **"Start Server"**
4. Open the mobile app and use the **Auto-Scan** feature to connect automatically
5. Enter the token displayed in the server GUIaller

### Technical Highlights
- **Offline-First Architecture** - Works perfectly on local hotspots without internet
- **Cross-Platform** - React Native (iOS/Android) + Python (Windows)
- **Low-Level Integration** - Direct Windows Core Audio API access via Pycaw
- **Security** - All API requests require Bearer token authorization
- **Automated CI/CD** - GitHub Actions builds and releases executables automatically

---

## Quick Start

### Option 1: Windows Executable (Recommended)

1. Download the executable from the [Releases page](https://github.com/seu-usuario/WifiMediaControl/releases)
2. Run `AudioRemote-Server.exe`
3. Click "Start Server"
4. Configure the mobile app with the displayed IP and token
Developer (Run from Source)

#### Backend (Python Server)
#### Python Server

```bash
# Clone repository
git clone https://github.com/matheus-fsc/WifiMediaControl.git
cd WifiMediaControl

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows

# Install dependencies
pip install -r server/requirements.txt

# Run server with GUI
python server/server_gui.py

# Or console mode (no GUI)
python server/server.py
```

#### Frontend (React Native Mobile App)

1. Install Node.js and npm (if not already installed)

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

Scan the QR code with **Expo Go** app (iOS/Android) or native camera.

**Configure connection:**
1. Open the app and tap **"Settings"**
2. Click the **scan button** to auto-discover the server
3. Select network type (Auto, Wi-Fi, Android Hotspot, or iOS Hotspot)
4. Enter the token displayed in the server GUI
5. Tap **"Save"**
cd server
.\build.ps1
```

The executable will be created at: `server/dist/AudioRemote-Server.exe`

For complete build documentation, see [server/BUILD.md](server/BUILD.md)

---
Technology Stack & Architecture framework (Python built-in)
- **Pillow 12.0.0** - Image processing
- **PyInstaller 6.11.1** - Executable compilation

---

## Project Structure

```
WifiMediaControl/
├── app/                          # Expo mobile application
│   ├── _contexts/                # React context providers
│   │   └── LocalizationContext.tsx
│   ├── _services/                # API service layer
│   │   └── api.ts
│   ├── locales/                  # i18n translations
│   │   ├── en.ts
│   │   ├──Application (Frontend)
- **Framework:** React Native / Expo SDK 54.0.0
- **Routing:** Expo Router 6.0.21 (File-based routing)
- **Language:** TypeScript (Type-safe API layer)
- **Storage:** AsyncStorage (Local persistence)
- **Networking:** Fetch API with timeout controls
- **i18n:** i18n-js + expo-localization (Auto-detection)
- **Icons:** @expo/vector-icons (Ionicons, MaterialCommunity)

### Desktop Server (Backend)
- **Core:** Python 3.11 + Flask 3.0.0 (REST API)
- **GUI:** Tkinter (Native Python GUI framework)
- **Audio Control:** Pycaw 20230407 (Windows Core Audio API wrapper)
- **Input Control:** Pynput 1.7.6 (Keyboard/Mouse simulation)
- **Image Processing:** Pillow 12.0.0
- **Distribution:** PyInstaller 6.11.1 (Binary compilation to `.exe`)

### DevOps & Automation
- **CI/CD:** GitHub Actions (Automated builds on tag push)
- **Version Control:** Git + GitHub
- **Build System:** PowerShell scripts + PyInstallertation
│   └── assets/
│       └── icon.png              # Server application icon
├── .github/workflows/            # CI/CD pipelines
│   └── build-release.yml         # Automated release builds
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

---

## Security

- **Token Authentication** - All API requests require Bearer token authorization
- **Persistent Token** - Saved in `server_token.txt` for consistency
- **Customizable Token** - Configure your own token via GUI
- **Local Network Only** - Server binds to LAN interface (0.0.0.0:5000)

---

## Internationalization

Supported languages:
- English (US)
- Portuguese (Brazil)

The application automatically detects the system language with manual override capability.

For detailed internationalization documentation, see [I18N_GUIDE.md](I18N_GUIDE.md)

---

## Releases and Deployment

### Creatin & Network

The application operates **exclusively on the local network (LAN)**.

- **Port:** 5000 (Default)
- **Authentication:** Token-based (Bearer Token) - Server generates a random token on first launch
- **Persistence:** Token saved in `server_token.txt` on desktop and secure storage on mobile
- **Customizable Token:** Configure your own token via GUI (no minimum length)
- **Network Binding:** Server binds to `0.0.0.0:5000` (LAN interface only)
- **Offline-First:** No internet connection required - works perfectly on mobile hotspots

---

## Building Windows Executable

To create a standalone Windows executable:

```bash
cd server
.\build.ps1
```

The executable will be created at: `server/dist/AudioRemote-Server.exe`

For complete build documentation, see [server/BUILD.md](server/BUILD.md)

### Automated Deployment

GitHub Actions automatically builds and releases the executable when you push a tag:

```bash
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

The workflow will:
1. Compile the Windows executable
2. Create a GitHub release
3. Attach `AudioRemote-Server.exe` as anoRemote-Server.exe
```

### Network Scanner Cannot Find Server

- Verify both devices are on the same Wi-Fi network
- EInternationalization

Supported languages:
- **English (US)**
- **Portuguese (Brazil)**

The application automatically detects the system language with manual override capability.

For detailed internationalization documentation, see [I18N_GUIDE.md](I18N_GUIDE.md)

---

## Support

Found a bug? [Open an issue](https://github.com/seu-usuario/WifiMediaControl/issues)

--- or hotspot
- Ensure the server is running (green status indicator)
- Temporarily disable VPNs
- Select the correct network type (Wi-Fi, Android Hotspot, iOS Hotspot)
- Try entering the IP address manually (shown in server GUI)

### Connection Issues

- Both mobile device and server must be on the same local network
- The server works offline - ideal for travel using mobile hotspot
- Check firewall settings (allow Python or AudioRemote-Server.exe)
- Tested on Windows 10/11, Android, and iOS with Expo Go

---

## License

This project is open source and available under the **MIT License**. Feel free to use, modify, and distribute.

---

## Contributing

Contributions are welcome! Please:
- Open issues for bugs or feature requests
- Submit pull requests with clear descriptions
- Follow existing code style and conventions

---

## Support

Found a bug or have questions? [Open an issue](https://github.com/matheus-fsc/WifiMediaControl/issues)

---

## Acknowledgments

Academic project developed at **Federal University of Itajubá (UNIFEI)**, combining concepts of:
- Distributed Systems
- Network Programming
- Mobile Development
- Low-Level OS Integration