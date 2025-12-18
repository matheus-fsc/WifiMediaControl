export default {
  // Home Screen
  home: {
    title: 'AudioRemote',
    playPause: 'Play/Pause',
    next: 'Next',
    previous: 'Previous',
    volume: 'Volume',
    settings: 'Settings',
    server: 'Server',
    status: {
      connected: 'Connected',
      disconnected: 'Disconnected',
      checking: 'Checking...',
    },
    warnings: {
      serverOffline: 'Server offline',
      reconnect: 'Reconnect',
    },
  },

  // Config Screen
  config: {
    title: 'Settings',
    back: 'Back',
    serverIP: 'Server IP Address:',
    serverIPPlaceholder: 'e.g.: 192.168.1.100',
    authToken: 'Authentication Token (optional):',
    authTokenPlaceholder: 'Paste server token here',
    testConnection: 'Test Connection',
    saveAndContinue: 'Save and Continue',
    loading: 'Loading settings...',
    language: 'Language:',
    languageAuto: 'Automatic (System)',
    languageEN: 'English',
    languagePT: 'Portuguese (Brazil)',
    
    tips: {
      title: 'Tip:',
      step1: '1. Run the Python server on your PC',
      step2: '2. Copy the token displayed in the terminal',
      step3: '3. Paste it here and save',
      step4: '4. Both devices must be on the same Wi-Fi network',
    },
    
    alerts: {
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      enterIP: 'Please enter an IP address.',
      invalidIPFormat: 'Invalid IP format. Use format: 192.168.1.100',
      connectionSuccess: 'Connection to server established!',
      connectionWarning: 'Server responded but may have issues.',
      connectionError: 'Could not connect to the server. Check:\n\n• Is the IP correct?\n• Is the server running?\n• Are both on the same network?',
      saveFailed: 'Could not save settings.',
    },
  },

  // Alerts
  alerts: {
    configNeeded: 'Configuration required',
    configNeededMessage: 'Configure the server IP before sending commands.',
    serverOffline: 'Server Offline',
    serverOfflineMessage: 'Could not connect to the server. Check connection?',
    cancel: 'Cancel',
    retry: 'Try Again',
    configure: 'Configure',
    authNeeded: 'Authentication Required',
    authNeededMessage: 'Invalid or missing token. Configure the token in settings.',
    error: 'Error',
    commandFailed: 'Could not send command: ',
  },
};
