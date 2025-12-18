import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMediaControlAPI } from './_services/api';
import { useLocalization } from './_contexts/LocalizationContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEYS = {
  SERVER_IP: '@audioremote:server_ip',
  SERVER_TOKEN: '@audioremote:server_token',
};

export default function HomeScreen() {
  const { ip: paramIp, token: paramToken } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocalization();
  
  const [ip, setIp] = useState('');
  const [token, setToken] = useState('');
  const [volume, setVolume] = useState(50);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
  const [loading, setLoading] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  
  const apiRef = useRef(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (paramIp) {
      setIp(paramIp);
      if (paramToken) setToken(paramToken);
    }
  }, [paramIp, paramToken]);

  useEffect(() => {
    if (ip) {
      apiRef.current = createMediaControlAPI(ip, token);
      checkConnection();
    }
  }, [ip, token]);

  const loadConfig = async () => {
    try {
      const [storedIp, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_IP),
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_TOKEN),
      ]);
      
      if (storedIp && !paramIp) {
        setIp(storedIp);
        if (storedToken) setToken(storedToken);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const checkConnection = async () => {
    if (!apiRef.current) return;

    setConnectionStatus('checking');
    const isConnected = await apiRef.current.ping();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  };

  const sendCommand = async (command) => {
    if (!ip) {
      Alert.alert(t('alerts.configNeeded'), t('alerts.configNeededMessage'));
      router.push('/config');
      return;
    }

    if (connectionStatus === 'disconnected') {
      Alert.alert(
        t('alerts.serverOffline'),
        t('alerts.serverOfflineMessage'),
        [
          { text: t('alerts.cancel'), style: "cancel" },
          { text: t('alerts.retry'), onPress: () => checkConnection() },
          { text: t('alerts.configure'), onPress: () => router.push('/config') }
        ]
      );
      return;
    }

    setLoading(true);
    setLastCommand(command);
    
    try {
      const result = await apiRef.current.sendCommand(command);
      
      if (!result.success) {
        if (result.message.includes('401') || result.message.includes('Unauthorized')) {
          Alert.alert(
            t('alerts.authNeeded'),
            t('alerts.authNeededMessage'),
            [{ text: t('alerts.configure'), onPress: () => router.push('/config') }]
          );
        } else {
          Alert.alert(t('alerts.error'), t('alerts.commandFailed') + result.message);
        }
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Erro ao enviar comando:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
      setLastCommand('');
    }
  };

  const adjustVolume = async (level) => {
    if (!ip) {
      Alert.alert(t('alerts.configNeeded'), t('alerts.configNeededMessage'));
      router.push('/config'); 
      return;
    }

    if (connectionStatus === 'disconnected') {
      await checkConnection();
      return;
    }

    try {
      const result = await apiRef.current.setVolume(level);
      
      if (!result.success) {
        if (result.message.includes('401') || result.message.includes('Unauthorized')) {
          Alert.alert(
            t('alerts.authNeeded'),
            t('alerts.authNeededMessage'),
            [{ text: t('alerts.configure'), onPress: () => router.push('/config') }]
          );
        } else {
          console.error('Erro ao ajustar volume:', result.message);
        }
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Erro ao ajustar volume:', error);
      setConnectionStatus('disconnected');
    }
  };

  const renderButton = (label, command, iconName, iconLibrary = 'Ionicons') => {
    const isActive = loading && lastCommand === command;
    const IconComponent = iconLibrary === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
    
    return (
      <TouchableOpacity
        style={[styles.button, isActive && styles.buttonActive]}
        onPress={() => sendCommand(command)}
        disabled={loading || connectionStatus === 'checking'}
      >
        {isActive ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <IconComponent name={iconName} size={24} color="#fff" />
            <Text style={styles.buttonText}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#1DB954';
      case 'disconnected': return '#FF6347';
      case 'checking': return '#FFA500';
      default: return '#999';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return t('home.status.connected');
      case 'disconnected': return t('home.status.disconnected');
      case 'checking': return t('home.status.checking');
      default: return t('home.status.checking');
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="headphones" size={32} color="#1DB954" />
          <Text style={styles.title}>{t('home.title')}</Text>
        </View>
      </View>

      {connectionStatus === 'disconnected' && (
        <View style={styles.warningBanner}>
          <View style={styles.warningContent}>
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.warningText}>{t('home.warnings.serverOffline')}</Text>
          </View>
          <TouchableOpacity onPress={checkConnection} style={styles.retryButton}>
            <Ionicons name="refresh" size={16} color="#FF6347" />
            <Text style={styles.retryText}>{t('home.warnings.reconnect')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controlsContainer}>
        {renderButton(t('home.playPause'), "playpause", "play-pause", 'MaterialCommunityIcons')}
        {renderButton(t('home.next'), "next", "play-skip-forward")}
        {renderButton(t('home.previous'), "prev", "play-skip-back")}

        <View style={styles.sliderContainer}>
          <View style={styles.volumeLabelContainer}>
            <Ionicons name="volume-high" size={24} color="#1DB954" />
            <Text style={styles.sliderLabel}>{t('home.volume')}: {volume}%</Text>
          </View>
          {Platform.OS === 'web' ? (
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              onMouseUp={() => adjustVolume(volume)}
              style={{ width: '100%' }}
            />
          ) : (
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={volume}
              onValueChange={setVolume}
              onSlidingComplete={adjustVolume}
              minimumTrackTintColor="#1DB954"
              maximumTrackTintColor="#535353"
              thumbTintColor="#1DB954"
            />
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          {connectionStatus === 'checking' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.statusDot} />
          )}
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.configButton]}
          onPress={() => router.push('/config')}
        >
          <Ionicons name="settings" size={24} color="#fff" />
          <Text style={styles.buttonText}>{t('home.settings')}</Text>
        </TouchableOpacity>
        
        {ip && (
          <View style={styles.ipContainer}>
            <Ionicons name="server" size={16} color="#999" />
            <Text style={styles.ipText}>{t('home.server')}: {ip}:5000</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  warningBanner: {
    backgroundColor: '#FF6347',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retryText: {
    color: '#FF6347',
    fontWeight: 'bold',
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
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
  buttonActive: {
    backgroundColor: '#1ed760',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  configButton: {
    backgroundColor: '#535353',
    marginTop: 10,
  },
  sliderContainer: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
  },
  volumeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  ipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  ipText: {
    color: '#999',
    fontSize: 12,
  },
});