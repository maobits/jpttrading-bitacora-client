import { fetchPositionProfitability } from "./PositionProfitabilityCalculator";

// Interfaz para los datos del portafolio
export interface PositionData {
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
  ClosingDate: string;
}

// Interfaz del resultado final
export interface RentabilidadTotalResult {
  detallePorMes: {
    [mes: string]: {
      promedioMensual: number;
      numeroRegistros: number;
      rentabilidades: number[];
    };
  };
  rentabilidadTotalCompuesta: number;
  rentabilidadTotalCompuestaDecimal: number;
}

export const obtenerRentabilidadTotal = async (
  portfolio: PositionData[]
): Promise<RentabilidadTotalResult> => {
  const agrupadoPorMes: Record<string, number[]> = {};

  console.log("📦 Iniciando análisis de rentabilidad total del portafolio...");
  console.log(`📊 Total de posiciones a procesar: ${portfolio.length}`);

  for (const position of portfolio) {
    console.log(`\n➡️ Procesando posición: ${position.Symbol}`);

    try {
      const result = await fetchPositionProfitability(position);
      console.log("🔍 Resultado:", result);

      const date = result?.date;
      const rentabilidadStr = result?.estadoActual?.rentabilidadTotal;
      const rentabilidad = parseFloat(rentabilidadStr);

      if (date && !isNaN(rentabilidad)) {
        const mes = date.slice(0, 7);
        console.log(`📅 Fecha de la posición: ${date} (grupo: ${mes})`);
        console.log(`📈 Rentabilidad total: ${rentabilidadStr}%`);

        if (!agrupadoPorMes[mes]) {
          agrupadoPorMes[mes] = [];
        }

        agrupadoPorMes[mes].push(rentabilidad);
      } else {
        console.warn(
          `⚠️ Rentabilidad inválida o sin fecha para: ${position.Symbol}`
        );
      }
    } catch (error) {
      console.error(`❌ Error procesando ${position.Symbol}:`, error);
    }
  }

  // 👇 Aquí se muestra el objeto agrupado
  console.log(
    "🧾 RTC - Colección agrupada por meses:",
    JSON.stringify(agrupadoPorMes, null, 2)
  );

  const detallePorMes: RentabilidadTotalResult["detallePorMes"] = {};
  let rentabilidadCompuestaDecimal = 1;

  console.log("\n📊 Calculando promedios por mes...");

  for (const mes in agrupadoPorMes) {
    const valores = agrupadoPorMes[mes];
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

    console.log(`🗓️ Mes: ${mes}`);
    console.log(`   ➕ Rentabilidades: ${valores.join(", ")}`);
    console.log(`   📊 Promedio mensual: ${promedio.toFixed(4)}%`);

    detallePorMes[mes] = {
      promedioMensual: parseFloat(promedio.toFixed(4)),
      numeroRegistros: valores.length,
      rentabilidades: valores,
    };

    // Aplicar como decimal directamente
    const promedioDecimal = parseFloat((promedio / 100).toFixed(5));
    console.log(
      `🔢 Aplicando: rentabilidadCompuestaDecimal *= 1 + ${promedioDecimal};`
    );
    rentabilidadCompuestaDecimal *= 1 + promedioDecimal;
  }

  const rentabilidadTotalCompuestaDecimal = rentabilidadCompuestaDecimal - 1;
  const rentabilidadTotalCompuesta = rentabilidadTotalCompuestaDecimal * 100;

  console.log(
    `\n📈 Rentabilidad total compuesta (decimal): ${rentabilidadTotalCompuestaDecimal.toFixed(
      4
    )}`
  );
  console.log(
    `📈 Rentabilidad total compuesta final: ${rentabilidadTotalCompuesta.toFixed(
      2
    )}%\n`
  );

  return {
    detallePorMes,
    rentabilidadTotalCompuesta: parseFloat(
      rentabilidadTotalCompuesta.toFixed(2)
    ),
    rentabilidadTotalCompuestaDecimal: parseFloat(
      rentabilidadTotalCompuestaDecimal.toFixed(6)
    ),
  };
};
