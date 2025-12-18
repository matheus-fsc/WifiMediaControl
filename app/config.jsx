import { Platform, ActionSheetIOS } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalization } from './_contexts/LocalizationContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const STORAGE_KEYS = {
  SERVER_IP: '@audioremote:server_ip',
  SERVER_TOKEN: '@audioremote:server_token',
};

export default function ConfigScreen() {
  const [ip, setIp] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [foundDevices, setFoundDevices] = useState([]);
  const router = useRouter();
  const { t, language, setLanguage } = useLocalization();

  useEffect(() => {
    loadStoredConfig();
  }, []);

  const loadStoredConfig = async () => {
    try {
      const [storedIp, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_IP),
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_TOKEN),
      ]);
      
      if (storedIp) setIp(storedIp);
      if (storedToken) setToken(storedToken);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateIP = (ipAddress) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipAddress)) return false;
    
    const parts = ipAddress.split('.');
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  };

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case 'auto': return t('config.languageAuto');
      case 'en': return t('config.languageEN');
      case 'pt-BR': return t('config.languagePT');
      default: return t('config.languageAuto');
    }
  };

  const showLanguageSelector = () => {
    const options = [
      t('config.languageAuto'),
      t('config.languageEN'),
      t('config.languagePT'),
      t('alerts.cancel')
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) setLanguage('auto');
          else if (buttonIndex === 1) setLanguage('en');
          else if (buttonIndex === 2) setLanguage('pt-BR');
        }
      );
    } else {
      // Android usa Alert.alert com botões
      Alert.alert(
        t('config.language'),
        '',
        [
          { text: t('config.languageAuto'), onPress: () => setLanguage('auto') },
          { text: t('config.languageEN'), onPress: () => setLanguage('en') },
          { text: t('config.languagePT'), onPress: () => setLanguage('pt-BR') },
          { text: t('alerts.cancel'), style: 'cancel' }
        ]
      );
    }
  };

  const autoScanNetwork = async () => {
    setScanning(true);
    setFoundDevices([]);
    setScanProgress('Iniciando scan...');
    
    // Padrões comuns de rede (ordem por probabilidade)
    const networkPatterns = [
      { base: '192.168.1', range: [1, 50] },    // Mais comum
      { base: '192.168.0', range: [1, 50] },    // Segundo mais comum
      { base: '192.168.18', range: [1, 50] },   // Padrão do servidor atual
      { base: '192.168.43', range: [1, 30] },   // Android hotspot
      { base: '192.168.49', range: [1, 30] },   // Android hotspot alternativo
      { base: '172.20.10', range: [1, 30] },    // iOS hotspot
      { base: '10.0.0', range: [1, 30] },       // Redes corporativas
    ];

    const found = [];
    let totalChecked = 0;

    for (const pattern of networkPatterns) {
      if (found.length > 0) break; // Se já encontrou, para o scan
      
      setScanProgress(`Escaneando ${pattern.base}.x...`);
      
      // Testar IPs em lotes para melhor performance
      const batchSize = 10;
      for (let start = pattern.range[0]; start <= pattern.range[1]; start += batchSize) {
        if (found.length > 0) break; // Se já encontrou, para
        
        const promises = [];
        const end = Math.min(start + batchSize - 1, pattern.range[1]);
        
        for (let i = start; i <= end; i++) {
          const testIp = `${pattern.base}.${i}`;
          
          promises.push(
            (async () => {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout de 3s

                const response = await fetch(`http://${testIp}:5000/ping`, {
                  method: 'GET',
                  signal: controller.signal,
                  headers: { 'Cache-Control': 'no-cache' }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                  console.log(`Encontrado: ${testIp}`);
                  found.push(testIp);
                  setFoundDevices(prev => [...prev, testIp]);
                }
              } catch (error) {
                // IP não respondeu ou timeout
              }
              totalChecked++;
              setScanProgress(`Verificados ${totalChecked} endereços...`);
            })()
          );
        }
        
        await Promise.all(promises);
      }
    }

    setScanning(false);
    setScanProgress('');

    if (found.length === 0) {
      Alert.alert(
        'Nenhum dispositivo encontrado',
        'Tente conectar o dispositivo na mesma rede ou insira o IP manualmente.'
      );
    } else if (found.length === 1) {
      // Se encontrou apenas um, usar automaticamente
      setIp(found[0]);
      Alert.alert(
        'Dispositivo encontrado!',
        `Servidor encontrado em ${found[0]}`
      );
    } else {
      // Múltiplos dispositivos encontrados, mostrar lista
      const options = [...found, t('alerts.cancel')];
      
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            title: `${found.length} dispositivos encontrados`,
            options,
            cancelButtonIndex: found.length,
          },
          (buttonIndex) => {
            if (buttonIndex < found.length) {
              setIp(found[buttonIndex]);
            }
          }
        );
      } else {
        Alert.alert(
          `${found.length} dispositivos encontrados`,
          'Selecione um:',
          [
            ...found.map(ip => ({
              text: ip,
              onPress: () => setIp(ip)
            })),
            { text: t('alerts.cancel'), style: 'cancel' }
          ]
        );
      }
    }
  };

  const testConnection = async () => {
    if (!ip.trim()) {
      Alert.alert(t('config.alerts.error'), t('config.alerts.enterIP'));
      return;
    }

    setTesting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`http://${ip.trim()}:5000/ping`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        Alert.alert(t('config.alerts.success'), t('config.alerts.connectionSuccess'));
      } else {
        Alert.alert(t('config.alerts.warning'), t('config.alerts.connectionWarning'));
      }
    } catch (error) {
      Alert.alert(
        t('config.alerts.error'),
        t('config.alerts.connectionError')
      );
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    const trimmedIp = ip.trim();
    const trimmedToken = token.trim();

    if (!trimmedIp) {
      Alert.alert(t('config.alerts.error'), t('config.alerts.enterIP'));
      return;
    }

    if (!validateIP(trimmedIp)) {
      Alert.alert(t('config.alerts.error'), t('config.alerts.invalidIPFormat'));
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SERVER_IP, trimmedIp),
        AsyncStorage.setItem(STORAGE_KEYS.SERVER_TOKEN, trimmedToken),
      ]);

      router.replace({ 
        pathname: '/', 
        params: { ip: trimmedIp, token: trimmedToken } 
      });
    } catch (error) {
      Alert.alert(t('config.alerts.error'), t('config.alerts.saveFailed'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>{t('config.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.push('/')}
      >
        <Text style={styles.backButtonText}>{t('config.back')}</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
        <View style={styles.titleContainer}>
          <Ionicons name="settings" size={32} color="#1DB954" />
          <Text style={styles.title}>{t('config.title')}</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Ionicons name="server-outline" size={20} color="#1DB954" />
            <Text style={styles.label}>{t('config.serverIP')}</Text>
          </View>
          <View style={styles.ipInputContainer}>
            <TextInput
              style={styles.ipInput}
              placeholder={t('config.serverIPPlaceholder')}
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={ip}
              onChangeText={setIp}
              editable={!saving && !testing && !scanning}
            />
            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanButtonActive]}
              onPress={autoScanNetwork}
              disabled={saving || testing || scanning}
            >
              {scanning ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="radio" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          {scanning && scanProgress && (
            <Text style={styles.scanProgress}>{scanProgress}</Text>
          )}
          {foundDevices.length > 0 && !scanning && (
            <Text style={styles.foundDevicesText}>
              {foundDevices.length} dispositivo(s) encontrado(s)
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Ionicons name="key-outline" size={20} color="#1DB954" />
            <Text style={styles.label}>{t('config.authToken')}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={t('config.authTokenPlaceholder')}
            placeholderTextColor="#999"
            value={token}
            onChangeText={setToken}
            editable={!saving && !testing}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Ionicons name="language-outline" size={20} color="#1DB954" />
            <Text style={styles.label}>{t('config.language')}</Text>
          </View>
          <TouchableOpacity
            style={styles.languageSelector}
            onPress={showLanguageSelector}
          >
            <Text style={styles.languageSelectorText}>{getLanguageLabel(language)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.testButton, testing && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={testing || saving}
        >
          {testing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{t('config.testConnection')}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, saving && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={saving || testing}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{t('config.saveAndContinue')}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <View style={styles.infoTitleContainer}>
            <Ionicons name="bulb" size={20} color="#1DB954" />
            <Text style={styles.infoTitle}>{t('config.tips.title')}</Text>
          </View>
          <Text style={styles.infoText}>
            {t('config.tips.step1')}{'\n'}
            {t('config.tips.step2')}{'\n'}
            {t('config.tips.step3')}{'\n'}
            {t('config.tips.step4')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 10,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ipInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  ipInput: {
    flex: 1,
    backgroundColor: '#282828',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  scanButton: {
    backgroundColor: '#1DB954',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonActive: {
    backgroundColor: '#535353',
  },
  scanProgress: {
    color: '#1DB954',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  foundDevicesText: {
    color: '#1DB954',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#282828',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  languageSelector: {
    backgroundColor: '#282828',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  languageSelectorText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  testButton: {
    backgroundColor: '#535353',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 4,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#282828',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  infoBox: {
    backgroundColor: '#282828',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  infoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#b3b3b3',
    fontSize: 14,
    lineHeight: 20,
  },
});
