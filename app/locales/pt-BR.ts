export default {
  // Home Screen
  home: {
    title: 'AudioRemote',
    playPause: 'Play/Pause',
    next: 'Próxima',
    previous: 'Anterior',
    volume: 'Volume',
    settings: 'Configurações',
    server: 'Servidor',
    status: {
      connected: 'Conectado',
      disconnected: 'Desconectado',
      checking: 'Verificando...',
    },
    warnings: {
      serverOffline: 'Servidor offline',
      reconnect: 'Reconectar',
    },
  },

  // Config Screen
  config: {
    title: 'Configurações',
    back: 'Voltar',
    serverIP: 'Endereço IP do Servidor:',
    serverIPPlaceholder: 'ex: 192.168.1.100',
    authToken: 'Token de Autenticação (opcional):',
    authTokenPlaceholder: 'Cole o token do servidor aqui',
    testConnection: 'Testar Conexão',
    saveAndContinue: 'Salvar e Continuar',
    loading: 'Carregando configurações...',
    language: 'Idioma:',
    languageAuto: 'Automático (Sistema)',
    languageEN: 'Inglês',
    languagePT: 'Português (Brasil)',
    
    tips: {
      title: 'Dica:',
      step1: '1. Execute o servidor Python no PC',
      step2: '2. Copie o token exibido no terminal',
      step3: '3. Cole aqui e salve',
      step4: '4. Ambos devem estar na mesma rede Wi-Fi',
    },
    
    alerts: {
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      enterIP: 'Por favor, insira um IP.',
      invalidIPFormat: 'Formato de IP inválido. Use o formato: 192.168.1.100',
      connectionSuccess: 'Conexão com o servidor estabelecida!',
      connectionWarning: 'Servidor respondeu mas pode estar com problemas.',
      connectionError: 'Não foi possível conectar ao servidor. Verifique:\n\n• O IP está correto?\n• O servidor está rodando?\n• Ambos estão na mesma rede?',
      saveFailed: 'Não foi possível salvar as configurações.',
    },
  },

  // Alerts
  alerts: {
    configNeeded: 'Configuração necessária',
    configNeededMessage: 'Configure o IP do servidor antes de enviar comandos.',
    serverOffline: 'Servidor Offline',
    serverOfflineMessage: 'Não foi possível conectar ao servidor. Verificar conexão?',
    cancel: 'Cancelar',
    retry: 'Tentar Novamente',
    configure: 'Configurar',
    authNeeded: 'Autenticação Necessária',
    authNeededMessage: 'Token inválido ou ausente. Configure o token nas configurações.',
    error: 'Erro',
    commandFailed: 'Não foi possível enviar o comando: ',
  },
};
