import serverConfig from "@/store/config/server.json";

interface ServerConfig {
  name: string;
  ip: string;
  port: number;
}

interface Config {
  isDevelopment: boolean;
  development: {
    server: ServerConfig;
  };
  production: {
    server: ServerConfig;
  };
}

class ConnectionService {
  private config: Config;

  constructor() {
    this.config = serverConfig as Config;
  }

  /**
   * Determina si el entorno actual es de desarrollo.
   * @returns {boolean}
   */
  public isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  /**
   * Obtiene la configuración del servidor actual basada en el entorno.
   * @returns {ServerConfig} Configuración del servidor.
   */
  public getServerConfig(): ServerConfig {
    return this.config.isDevelopment
      ? this.config.development.server
      : this.config.production.server;
  }
}

// Exportar una instancia única del servicio
const connectionService = new ConnectionService();
export default connectionService;
