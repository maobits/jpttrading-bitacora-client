import config from "@/store/config/calculatorServer.json";
import ENDPOINTS from "@/store/config/endpoints";

interface PositionData {
  id: number;
  order: string;
  Symbol: string;
  PriceEntry: string;
  StopLoss: string;
  TakeProfit: string;
  TradeDirection: string;
  PositionType: string;
  TakeProfit2: string;
  ActiveAllocation: string;
  ClosingDate: string;
}

export async function fetchPositionProfitability(position: PositionData) {
  try {
    const serverConfig = config.isDevelopment
      ? config.development.server
      : config.production.server;
    const baseURL = ENDPOINTS.POSITION_PROFITABILITY;

    const priceEntries = JSON.parse(position.PriceEntry);
    const allocations = JSON.parse(position.ActiveAllocation);

    const tipoPosicion = position.TradeDirection === "Buy" ? "largo" : "corto";
    const precioEntrada = parseFloat(
      priceEntries.find((entry: any) => entry.id === 1)?.price || "0"
    );
    const symbol = position.Symbol;

    const closingDate = position.ClosingDate;

    const transacciones = priceEntries
      .slice(1)
      .map((entry: any) => {
        const allocation = allocations.find(
          (alloc: any) => alloc.id === entry.id
        );
        if (!allocation) return null;

        const porcentaje = parseFloat(allocation.activeAllocation) / 100;
        const tipo =
          entry.type === "add"
            ? "adicion"
            : entry.type === "decrease"
            ? "toma_parcial"
            : "cierre_total";

        return { tipo, porcentaje, precio: parseFloat(entry.price) };
      })
      .filter(Boolean);

    const requestData = {
      tipoPosicion,
      precioEntrada,
      symbol,
      transacciones,
      closingDate,
    };

    console.log(
      "📤 Objeto enviado a la calculadora:",
      JSON.stringify(requestData, null, 2)
    );
    console.log("🚀 Enviando solicitud al servidor:", requestData);

    const response = await fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "✅ Respuesta recibida  para elcalculo de la posición *importante:",
      data
    );
    return data;
  } catch (err: any) {
    console.error("❌ Error al procesar la solicitud:", err);
    return { error: err.message || "No disponible" };
  }
}
