import axios from "axios";
import connectionService from "@/hooks/recipes/ConnectionService";
import GeneralToken from "@/store/config/GeneralToken.json"; // Importa el token general

interface StockData {
  symbol: string;
  price: number;
  currency: string;
  marketTime: string;
}

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const YFinanceService = {
  // Obtener cotización actual
  async getQuote(symbol: string): Promise<StockData | string> {
    try {
      console.log(`🚀 Solicitando cotización para el símbolo: ${symbol}`);

      const { ip, port } = connectionService.getServerConfig();
      console.log("🌐 Configuración del servidor obtenida:", { ip, port });

      const baseURL = `http://${ip}:${port}/api/yfinance/quote/${symbol}`;
      console.log(`🔗 Construyendo URL para la solicitud: ${baseURL}`);

      const response = await axios.get(baseURL, {
        headers: {
          "x-api-key": GeneralToken.token, // Incluye el token en el encabezado
        },
      });
      console.log("✅ Cotización obtenida con éxito:", response.data);

      return response.data;
    } catch (error: any) {
      console.error(
        `❌ Error al obtener la cotización para ${symbol}:`,
        error.message
      );
      console.error("Detalles del error:", error.response?.data || error);

      return "No disponible";
    }
  },

  // Obtener datos históricos
  async getHistoricalData(
    symbol: string,
    period: string = "1mo"
  ): Promise<HistoricalData[] | string> {
    try {
      console.log(
        `🚀 Solicitando datos históricos para el símbolo: ${symbol} con periodo: ${period}`
      );

      const { ip, port } = connectionService.getServerConfig();
      console.log("🌐 Configuración del servidor obtenida:", { ip, port });

      const baseURL = `http://${ip}:${port}/api/yfinance/historical/${symbol}`;
      console.log(`🔗 Construyendo URL para la solicitud: ${baseURL}`);

      const response = await axios.get(baseURL, {
        params: { period },
        headers: {
          "x-api-key": GeneralToken.token, // Incluye el token en el encabezado
        },
      });
      console.log("✅ Datos históricos obtenidos con éxito:", response.data);

      return response.data;
    } catch (error: any) {
      console.error(
        `❌ Error al obtener datos históricos para ${symbol}:`,
        error.message
      );
      console.error("Detalles del error:", error.response?.data || error);

      return "No disponible";
    }
  },

  // Buscar activos financieros
  async search(query: string): Promise<any> {
    try {
      console.log(`🚀 Iniciando búsqueda para el término: ${query}`);

      const { ip, port } = connectionService.getServerConfig();
      console.log("🌐 Configuración del servidor obtenida:", { ip, port });

      const baseURL = `http://${ip}:${port}/api/yfinance/search`;
      console.log(`🔗 Construyendo URL para la búsqueda: ${baseURL}`);

      const response = await axios.get(baseURL, {
        params: { query },
        headers: {
          "x-api-key": GeneralToken.token, // Incluye el token en el encabezado
        },
      });
      console.log(
        "✅ Resultados de búsqueda obtenidos con éxito:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(`❌ Error al buscar el término "${query}":`, error.message);
      console.error("Detalles del error:", error.response?.data || error);

      throw new Error("No se pudo completar la búsqueda.");
    }
  },
};

export default YFinanceService;
