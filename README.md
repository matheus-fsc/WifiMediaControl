# AudioRemote

**AudioRemote** is a modern remote media control application for local networks. Built with **Expo/React Native** for mobile and **Python Flask** with a **tkinter** GUI for desktop, it enables seamless wireless media control over your local network.

---

## Features

### Mobile Application
- Play/Pause control
- Next/Previous track navigation
- Volume control with interactive slider
- Automatic network scanner (discovers server automatically)
- Token-based authentication
- Multi-language support (English/Portuguese-BR)
- Real-time connection status indicator
- Persistent configuration storage

### Desktop Server
- Modern tkinter GUI interface
- Automatic local IP detection and display
- Token management (copy, generate, customize)
- Real-time activity monitor
- Start/Stop server with one click
- Quick copy for IP and authentication token
- Toggleable activity log display

---

## Quick Start

### Option 1: Windows Executable (Recommended)

1. Download the executable from the [Releases page](https://github.com/seu-usuario/WifiMediaControl/releases)
2. Run `AudioRemote-Server.exe`
3. Click "Start Server"
4. Configure the mobile app with the displayed IP and token

### Option 2: Run from Source

#### Python Server

1. Clone the repository:
```bash
git clone https://github.com/seu-usuario/WifiMediaControl.git
cd WifiMediaControl
```

2. Create virtual environment:
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
```

3. Install dependencies:
```bash
pip install -r server/requirements.txt
```

4. Run the server with GUI:
```bash
python server/server_gui.py
```

Or without GUI (console mode):
```bash
python server/server.py
```

#### Mobile Application

1. Install Node.js and npm (if not already installed)

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Scan the QR code with:
   - **iOS:** Expo Go app
   - **Android:** Expo Go app or native camera

5. Configure the server connection:
   - Open the app
   - Tap "Settings"
   - Use the automatic scanner or enter IP manually
   - Paste the token shown in the server GUI
   - Tap "Save"

---

## Building Windows Executable

To create a standalone Windows executable:

```bash
cd server
.\build.ps1
```

The executable will be created at: `server/dist/AudioRemote-Server.exe`

For complete build documentation, see [server/BUILD.md](server/BUILD.md)

---

## Technology Stack

### Mobile Frontend
- **Expo SDK 54.0.0** - React Native framework
- **expo-router 6.0.21** - File-based routing
- **TypeScript** - Type-safe API service
- **AsyncStorage** - Local persistence
- **i18n-js** - Internationalization
- **@expo/vector-icons** - Icon libraries (Ionicons, MaterialCommunity)

### Desktop Backend
- **Flask 3.0.0** - Python web framework
- **pynput 1.7.6** - Keyboard and mouse control
- **pycaw 20230407** - Windows audio control
- **tkinter** - GUI framework (Python built-in)
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
│   │   ├── pt-BR.ts
│   │   └── index.ts
│   ├── _layout.tsx               # Root layout
│   ├── index.jsx                 # Main screen (media controls)
│   └── config.jsx                # Settings screen
├── assets/                       # Static resources
│   └── images/
│       └── remoteControlIco.png
├── server/                       # Python server
│   ├── server.py                 # Flask server (console)
│   ├── server_gui.py             # Flask server with GUI
│   ├── requirements.txt          # Python dependencies
│   ├── requirements-build.txt    # Build dependencies
│   ├── build.ps1                 # Build script
│   ├── BUILD.md                  # Build documentation
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

### Creating a New Release

1. Build the executable:
```bash
cd server
.\build.ps1
```

2. Create and push a tag:
```bash
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

3. GitHub Actions will automatically:
   - Compile the Windows executable
   - Create a GitHub release
   - Attach the .exe artifact

---

## License

This project is open source. Feel free to use, modify, and distribute.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

---

## Troubleshooting

### Windows Firewall

If the mobile app cannot connect, add a firewall exception:
```
Control Panel → Firewall → Allow an app
→ Add Python or AudioRemote-Server.exe
```

### Network Scanner Cannot Find Server

- Verify both devices are on the same Wi-Fi network
- Ensure the server is running
- Temporarily disable VPNs
- Try entering the IP address manually (shown in server GUI)

### Connection Issues

- Both mobile device and server must be on the same local network
- The server works offline, ideal for travel using mobile hotspot
- Tested on Windows 11, Android, and iOS with Expo Go

---

## Support

Found a bug? [Open an issue](https://github.com/seu-usuario/WifiMediaControl/issues)

---

## Acknowledgments

Academic project developed at Federal University of Itajubá (UNIFEI).

**Built with Expo and Python**
