import config from "@/store/config/calculatorServer.json";

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
    TradeDate: string;
    State: boolean;
    SavedPrice: string;
}

interface ApiResponse {
    results: PositionData[];
}

export async function fetchPortfolioProfitability(apiResponse: ApiResponse) {
    try {
        console.log("📩 Datos de entrada crudos:", JSON.stringify(apiResponse, null, 2));

        const serverConfig = config.isDevelopment ? config.development.server : config.production.server;
        const baseURL = `http://${serverConfig.ip}:${serverConfig.port}/portfolio-profitability`;

        const requestData = apiResponse.results.map(position => {
            if (!position.PriceEntry || !position.ActiveAllocation) {
                console.warn(`⚠️ Datos faltantes en la posición ID: ${position.id}`);
                return null;
            }

            let priceEntries, allocations;
            try {
                priceEntries = JSON.parse(position.PriceEntry);
                allocations = JSON.parse(position.ActiveAllocation);

                if (!Array.isArray(priceEntries) || !Array.isArray(allocations)) {
                    console.error(`❌ Datos incorrectos en posición ID ${position.id}`);
                    return null;
                }
            } catch (error) {
                console.error(`❌ Error al parsear JSON en posición ID ${position.id}:`, error);
                return null;
            }

            const tipoPosicion = position.TradeDirection === "Buy" ? "largo" : "corto";
            const precioEntrada = parseFloat(priceEntries.find((entry: any) => entry.id === 1)?.price || "0");
            const symbol = position.Symbol;

            const transacciones = priceEntries.slice(1).map((entry: any) => {
                const allocation = allocations.find((alloc: any) => alloc.id === entry.id);
                if (!allocation) return null;

                const porcentaje = allocation.activeAllocation ? parseFloat(allocation.activeAllocation) / 100 : 0;
                const tipo = entry.type === "add" ? "adicion" : entry.type === "decrease" ? "toma_parcial" : "cierre_total";
                
                return { tipo, porcentaje, precio: parseFloat(entry.price) };
            }).filter(Boolean);

            return { tipoPosicion, precioEntrada, symbol, transacciones };
        }).filter(Boolean);

        console.log("📤 Objeto generado antes de enviar:", JSON.stringify(requestData, null, 2));

        if (requestData.length === 0) {
            console.error("❌ No hay datos válidos para enviar al servidor.");
            return { error: "No hay datos válidos para calcular el portafolio." };
        }

        console.log("🚀 Enviando solicitud al servidor:", JSON.stringify(requestData, null, 2));

        const response = await fetch(baseURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const responseText = await response.text();
        try {
            const data = JSON.parse(responseText);
            console.log("✅ Respuesta recibida:", data);
            return data;
        } catch (error) {
            console.error("❌ Error al parsear respuesta del servidor:", responseText);
            return { error: "Respuesta del servidor no es un JSON válido" };
        }
    } catch (err: any) {
        console.error("❌ Error al procesar la solicitud:", err);
        return { error: err.message || "No disponible" };
    }
}
