import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@/hooks/useThemeProvider";
import YFinanceService from "@/hooks/recipes/YFinanceService";
import SnackHistoricalEntries from "./SnackHistoricalEntries"; // Importa el componente

interface SnackHistoricalSymbolProps {
  symbol: string;
  period?: string; // Período opcional, por defecto "1mo"
  priceHistory: { id: number; price: string; date: string }[]; // Historial de precios
  activeAllocationHistory: {
    id: number;
    activeAllocation: string;
    date: string;
  }[]; // Historial de asignación activa
}

const SnackHistoricalSymbol: React.FC<SnackHistoricalSymbolProps> = ({
  symbol,
  period = "1mo",
  priceHistory,
  activeAllocationHistory,
}) => {
  const { colors, fonts } = useTheme();
  const [historicalData, setHistoricalData] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{
    date: string;
    value: number;
  } | null>(null);

  const [financialStats, setFinancialStats] = useState<{
    average: number;
    max: number;
    min: number;
    volatility: number;
    trend: string;
    changePercent: string;
  } | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const data = await YFinanceService.getHistoricalData(symbol, period);
        if (typeof data === "string") {
          setHistoricalData([]);
          setDates([]);
          setFinancialStats(null);
        } else {
          const prices = data.map((item: any) => item.close); // Cierres diarios
          const rawDates = data.map((item: any) => item.date); // Fechas originales

          setHistoricalData(prices);
          setDates(rawDates);

          // Calcular estadísticas financieras
          const average = prices.reduce((a, b) => a + b, 0) / prices.length;
          const max = Math.max(...prices);
          const min = Math.min(...prices);
          const volatility = Math.sqrt(
            prices
              .map((p) => Math.pow(p - average, 2))
              .reduce((a, b) => a + b, 0) / prices.length
          );
          const trend =
            prices[0] < prices[prices.length - 1]
              ? "Al alza"
              : prices[0] > prices[prices.length - 1]
              ? "A la baja"
              : "Estable";
          const changePercent = (
            ((prices[prices.length - 1] - prices[0]) / prices[0]) *
            100
          ).toFixed(2);

          setFinancialStats({
            average,
            max,
            min,
            volatility,
            trend,
            changePercent: `${changePercent}%`,
          });
        }
      } catch (error) {
        console.error(
          `Error al obtener datos históricos para ${symbol}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, period]);

  const handleDataPointClick = (data: any) => {
    const { index, value } = data;

    // Usar la fecha original del conjunto de datos
    const rawDate = dates[index] || "";
    const formattedDate = new Date(rawDate).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long", // Nombre completo del mes
      year: "numeric",
    });

    setSelectedPoint({ date: formattedDate, value });
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  if (historicalData.length === 0) {
    return (
      <Text style={[styles.errorText, { color: colors.text }]}>
        Datos no disponibles.
      </Text>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LineChart
        data={{
          labels: [], // Sin etiquetas en el eje X
          datasets: [{ data: historicalData }],
        }}
        width={Dimensions.get("window").width - 40} // Ancho del gráfico
        height={220} // Alto del gráfico
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(242, 183, 5, ${opacity})`, // Color del gráfico: #F2B705
          labelColor: () => colors.text,
          style: {
            borderRadius: 10,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#F2B705", // Color de los puntos
          },
        }}
        bezier
        onDataPointClick={handleDataPointClick}
        style={{
          marginVertical: 8,
          borderRadius: 10,
        }}
      />
      {selectedPoint && (
        <View style={[styles.tooltip, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.tooltipText,
              { color: colors.primary, fontSize: 18 },
            ]}
          >
            Fecha: {selectedPoint.date}
          </Text>
          <Text
            style={[
              styles.tooltipText,
              { color: colors.primary, fontSize: 18 },
            ]}
          >
            Valor: ${selectedPoint.value.toFixed(2)}
          </Text>
        </View>
      )}
      {financialStats && (
        <View
          style={[styles.tableContainer, { backgroundColor: colors.surface }]}
        >
          <View style={styles.headerWithSymbol}>
            <Text style={[styles.tableHeader, { color: colors.primary }]}>
              Estadísticas Financieras
            </Text>
            <Text style={[styles.symbolText, { color: colors.primary }]}>
              {symbol}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLabel, { color: "#FFFFFF" }]}>
              Promedio:
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.primary }]}>
              ${financialStats.average.toFixed(2)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLabel, { color: "#FFFFFF" }]}>
              Máximo:
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.primary }]}>
              ${financialStats.max.toFixed(2)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLabel, { color: "#FFFFFF" }]}>
              Mínimo:
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.primary }]}>
              ${financialStats.min.toFixed(2)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLabel, { color: "#FFFFFF" }]}>
              Volatilidad:
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.primary }]}>
              ${financialStats.volatility.toFixed(2)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLabel, { color: "#FFFFFF" }]}>
              Tendencia:
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.primary }]}>
              {financialStats.trend}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLabel, { color: "#FFFFFF" }]}>
              Cambio Acumulado:
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.primary }]}>
              {financialStats.changePercent}
            </Text>
          </View>
        </View>
      )}
      {/* Integración del componente SnackHistoricalEntries */}
      <SnackHistoricalEntries
        priceHistory={priceHistory}
        activeAllocationHistory={activeAllocationHistory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  errorText: {
    fontFamily: "Raleway-Bold",
    fontSize: 16,
    textAlign: "center",
  },
  tooltip: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  tooltipText: {
    fontFamily: "Raleway-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  tableContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  headerWithSymbol: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  tableHeader: {
    fontFamily: "Raleway-Bold",
    fontSize: 18,
  },
  symbolText: {
    fontFamily: "Raleway-Bold",
    fontSize: 18,
    marginLeft: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableCellLabel: {
    fontFamily: "Raleway-Regular",
    fontSize: 16,
    flex: 1,
    textAlign: "left",
  },
  tableCellValue: {
    fontFamily: "Raleway-Regular",
    fontSize: 16,
    flex: 1,
    textAlign: "right",
  },
});

export default SnackHistoricalSymbol;
