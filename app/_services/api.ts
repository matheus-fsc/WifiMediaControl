/**
 * Serviço centralizado para comunicação com o servidor de controle de mídia
 */

export interface MediaControlConfig {
  baseURL: string;
  token?: string;
  timeout?: number;
}

export interface CommandResponse {
  success: boolean;
  message: string;
}

export type MediaCommand = 'playpause' | 'next' | 'prev';

export class MediaControlAPI {
  private baseURL: string;
  private token?: string;
  private timeout: number;

  constructor(config: MediaControlConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
    this.timeout = config.timeout || 5000;
  }

  /**
   * Testa a conexão com o servidor
   */
  async ping(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/ping`, {
        method: 'GET',
        signal: controller.signal,
        headers: this.getHeaders(),
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }

  /**
   * Envia um comando de mídia (play/pause, next, prev)
   */
  async sendCommand(command: MediaCommand): Promise<CommandResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/command/${command}`, {
        method: 'POST',
        signal: controller.signal,
        headers: this.getHeaders(),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      return { success: true, message: text };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao enviar comando ${command}:`, message);
      return { success: false, message };
    }
  }

  /**
   * Ajusta o volume do sistema
   */
  async setVolume(level: number): Promise<CommandResponse> {
    if (level < 0 || level > 100) {
      return { success: false, message: 'Volume deve estar entre 0 e 100' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/volume`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      return { success: true, message: text };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao ajustar volume:', message);
      return { success: false, message };
    }
  }

  /**
   * Atualiza o token de autenticação
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Atualiza a URL base do servidor
   */
  setBaseURL(url: string) {
    this.baseURL = url;
  }

  /**
   * Retorna os headers comuns para todas as requisições
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }
}

/**
 * Cria uma instância da API com base em um IP
 */
export function createMediaControlAPI(ip: string, token?: string): MediaControlAPI {
  return new MediaControlAPI({
    baseURL: `http://${ip}:5000`,
    token,
    timeout: 5000,
  });
}
