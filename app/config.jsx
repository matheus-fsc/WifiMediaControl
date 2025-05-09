import { Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

// Função para escanear dispositivos na rede local
export const scanNetworkDevices = async (ports = [5000]) => {
  const devices = [];

  if (Platform.OS === 'web') {
    console.warn('Detecção de rede não é suportada na web. Configure o IP manualmente.');
    return devices;
  }

  try {
    const NetworkInfo = require('react-native-network-info');
    const localIP = await NetworkInfo.getIPAddress();
    const subnetMask = await NetworkInfo.getSubnet();
    console.log('Local IP:', localIP);
    console.log('Subnet Mask:', subnetMask);
  } catch (error) {
    console.error('Erro ao obter informações de rede:', error);
  }

  return devices;
};

export default function ConfigScreen() {
  const [ip, setIp] = useState('');
  const router = useRouter();

  const handleSave = () => {
    if (!ip.trim()) {
      Alert.alert('Erro', 'Por favor, insira um IP válido.');
      return;
    }
    router.replace({ pathname: '/', params: { ip: ip.trim() } });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}
      >
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Endereço IP do Servidor:</Text>
      <TextInput
        style={styles.input}
        placeholder="ex: 192.168.1.100"
        keyboardType="default"
        value={ip}
        onChangeText={setIp}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar e continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  }
});
