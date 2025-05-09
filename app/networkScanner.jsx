import { NetworkInfo } from 'react-native-network-info';
import { Platform } from 'react-native';

// Função para escanear dispositivos na rede local
export const scanNetworkDevices = async (ports = [5000]) => {
  const devices = [];

   if (Platform.OS === 'web') {
    console.warn('Detecção de rede não é suportada na web. Configure o IP manualmente.');
    return devices;
  }

  // Obtém o endereço IP e a máscara de sub-rede
  const localIP = await NetworkInfo.getIPAddress();
  const subnetMask = await NetworkInfo.getSubnet();

  if (!localIP || !subnetMask) {
    console.error("Não foi possível obter o endereço IP ou a máscara de sub-rede.");
    return devices;
  }

  // Calcula o intervalo de IP com base na máscara de sub-rede
  const ipParts = localIP.split('.');
  const maskParts = subnetMask.split('.');

  for (let i = 0; i < 4; i++) {
    ipParts[i] = (parseInt(ipParts[i]) & parseInt(maskParts[i])).toString();
  }

  const networkBase = ipParts.join('.');

  // Varre o intervalo de IPs válidos
  for (let i = 1; i < 255; i++) {
    const targetIP = `${networkBase}.${i}`;

    for (const port of ports) {
      try {
        const response = await fetch(`http://${targetIP}:${port}`, { method: 'GET', timeout: 1000 });
        if (response.ok) {
          devices.push({ ip: targetIP, port });
        }
      } catch (error) {
        // Ignora erros, pois apenas interessa os que respondem
      }
    }
  }

  return devices;  
};
