import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import Slider from '@react-native-community/slider';

export default function HomeScreen() {
  const { ip } = useLocalSearchParams();
  const router = useRouter();
  const [volume, setVolume] = useState(50);

  const sendCommand = async (command) => {
    if (!ip) {
      Alert.alert("Erro", "Por favor, configure um IP antes de enviar comandos.");
      router.push('/config');
      return;
    }

    try {
      const response = await fetch(`http://${ip}:5000/command/${command}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error("Erro na requisição");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o comando.");
      console.error(error);
    }
  };

  const adjustVolume = async (level) => {
    if (!ip) {
      Alert.alert("Erro", "Por favor, configure um IP antes de enviar comandos.");
      router.push('/config'); 
      return;
    }

    try {
      const response = await fetch(`http://${ip}:5000/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      if (!response.ok) throw new Error("Erro na requisição");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível ajustar o volume.");
      console.error(error);
    }
  };

  const renderButton = (label, command) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => sendCommand(command)}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderButton("⏯ Play/Pause", "playpause")}
      {renderButton("⏭ Próxima", "next")}
      {renderButton("⏮ Anterior", "prev")}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Volume: {volume}%</Text>
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
      <TouchableOpacity
        style={[styles.button, styles.configButton]}
        onPress={() => router.push('/config')}
      >
        <Text style={styles.buttonText}>⚙️ Configurar IP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  configButton: {
    backgroundColor: '#535353',
  },
  backButton: {
    backgroundColor: '#FF6347',
  },
  sliderContainer: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 20,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});