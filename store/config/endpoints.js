
import connectionService from "@/hooks/recipes/ConnectionService"; // Importa el servicio de conexión
import config from "@/store/config/calculatorServer.json";


const { ip, port } = connectionService.getServerConfig();
const serverConfig = config.isDevelopment ? config.development.server : config.production.server;
IS_DEV_MODE = false;

// Definir la configuración basada en el modo de desarrollo
const ENDPOINTS = IS_DEV_MODE
  ? {
     // Position service endpoints.  
    POSITIONS: `http://${ip}:${port}/api/positions`,
    CLOSED_POSITIONS: `http://${ip}:${port}/api/positions/closed-positions`,
    CLOSED_POITIONS_WITH_FILTER: `http://${ip}:${port}/api/positions/closed-positions-with-filter`,
    CREATE_POSITIONS: `http://${ip}:${port}/api/positions`,

    // Endpoints of the financial service.
    GET_COUTE: `http://${ip}:${port}/api/yfinance/quote/`,
    GET_HISTORICAL: `http://${ip}:${port}/api/yfinance/historical/`,
    GET_SEARCH: `http://${ip}:${port}/api/yfinance/search`,

    // Endpoints of the financial calculator service.
    PORTFOLIO_PROFITABILITY: `http://${serverConfig.ip}:${serverConfig.port}/portfolio-profitability`,
    POSITION_PROFITABILITY: `http://${serverConfig.ip}:${serverConfig.port}/procesar-transacciones`,

    // Authentication service endpoints.
    LOGIN: `http://${ip}:${port}/api/positions/login`,

    }
  : {
      // Position service endpoints.  
      POSITIONS: `https://${ip}/api/positions`,
      CLOSED_POSITIONS: `https://${ip}/api/positions/closed-positions`,
      CLOSED_POITIONS_WITH_FILTER: `https://${ip}/api/positions/closed-positions-with-filter`,

      // Endpoints of the financial  service.
      GET_COUTE: `https://${ip}/api/yfinance/quote/`,
      GET_HISTORICAL: `https://${ip}/api/yfinance/historical/`,
      GET_SEARCH: `https://${ip}/api/yfinance/search`,

      // Endpoints of the financial calculator service.
      PORTFOLIO_PROFITABILITY: `https://${serverConfig.ip}/portfolio-profitability`,
      POSITION_PROFITABILITY: `https://${serverConfig.ip}/procesar-transacciones`,

      // Authentication service endpoints.
      LOGIN: `https://${ip}/api/positions/login`,
      
    };

export default ENDPOINTS;