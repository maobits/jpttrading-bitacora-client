import yahooFinance from "yahoo-finance2";

interface StockData {
  symbol: string;
  price: number;
  currency: string;
  marketTime: string;
}

interface YahooFinanceServiceType {
  getQuote(symbol: string): Promise<StockData>;
  getHistoricalData(symbol: string, range: string): Promise<any>;
  search(query: string): Promise<any>;
}

const YahooFinanceService: YahooFinanceServiceType = {
  async getQuote(symbol: string): Promise<StockData> {
    try {
      const data = await yahooFinance.quote(symbol);

      // Validate data and ensure required properties are present
      if (
        !data ||
        !data.symbol ||
        typeof data.regularMarketPrice !== "number"
      ) {
        throw new Error(`Invalid data for symbol: ${symbol}`);
      }

      const currency = data.currency || "Unknown";
      const marketTime =
        typeof data.regularMarketTime === "number"
          ? new Date(data.regularMarketTime * 1000).toLocaleString()
          : "N/A";

      return {
        symbol: data.symbol,
        price: data.regularMarketPrice,
        currency,
        marketTime,
      };
    } catch (error) {
      console.error(`Error al obtener la cotización para ${symbol}:`, error);
      throw error;
    }
  },

  async getHistoricalData(symbol: string, range: string): Promise<any> {
    try {
      return await yahooFinance.historical(symbol, { period1: range });
    } catch (error) {
      console.error(`Error al obtener datos históricos para ${symbol}:`, error);
      throw error;
    }
  },

  async search(query: string): Promise<any> {
    try {
      return await yahooFinance.search(query);
    } catch (error) {
      console.error(`Error al buscar "${query}":`, error);
      throw error;
    }
  },
};

export default YahooFinanceService;
