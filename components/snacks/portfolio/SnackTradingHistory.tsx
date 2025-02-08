import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Text, Card } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@/hooks/useThemeProvider";

const SnackTradingHistory = ({ portfolioResult = {}, showClosed = false, cycle = "2025-02" }) => {
  const { colors } = useTheme();
  const { groupedResults = {} } = portfolioResult;
  const cycleData = groupedResults[cycle] || {}; // Extraemos los resultados del ciclo actual
  const { estadoActual = {}, historial = [] } = cycleData;

  console.log("🔍 SnackTradingHistory Debug Log:");
  console.log("➡ portfolioResult:", portfolioResult);
  console.log("➡ ciclo seleccionado:", cycle);
  console.log("➡ cycleData:", cycleData);
  console.log("➡ estadoActual:", estadoActual);
  console.log("➡ showClosed:", showClosed);

  // Verificamos si no hay datos en el ciclo actual
  if (!estadoActual || Object.keys(estadoActual).length === 0) {
    console.warn("⚠ WARN: No data available in estadoActual for the selected cycle!");
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text_secondary }]}>
          No hay datos disponibles para este ciclo.
        </Text>
      </View>
    );
  }

  // Cálculo de la rentabilidad según el tipo de vista (cerrada o activa)
  const rentabilidad = showClosed
    ? parseFloat(estadoActual?.rentabilidadTotalCerrada || "0")
    : parseFloat(estadoActual?.rentabilidadTotalActiva || "0");

  console.log("➡ Rentabilidad Calculada:", rentabilidad);

  const profitColor = colors.primary; // ✅ Valores de rentabilidad en primary
  const backgroundGradient = {
    from: colors.background_light || "#121212",
    to: colors.background_dark || "#000000",
  };

  // Datos para el gráfico, mostrando el progreso entre "Inicio" y "Actual"
  const chartData = {
    labels: ["Inicio", "Actual"],
    datasets: [
      {
        data: [0, rentabilidad],
        color: (opacity = 1) => `rgba(${hexToRgb(colors.primary || "#F29F05")}, ${opacity})`,
        strokeWidth: 4,
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 RENDIMIENTO DEL  PORTAFOLIO</Text>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title
          title={showClosed ? "Rentabilidad cerrada" : "Rentabilidad activa"}
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          <Text style={[styles.profitValue, { color: profitColor }]}>
            {showClosed
              ? `Rentabilidad total cerrada: ${rentabilidad}%`
              : `Rentabilidad activa total: ${rentabilidad}%`}
          </Text>
        </Card.Content>
      </Card>

      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - 40}
        height={250}
        yAxisLabel="%"
        chartConfig={chartConfig(colors, backgroundGradient)}
        bezier
        style={styles.chart}
      />
    </ScrollView>
  );
};

// 🔹 Función para convertir HEX a RGB de forma segura
const hexToRgb = (hex) => {
  if (!hex || typeof hex !== "string") {
    return "255, 255, 255";
  }

  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

  if (cleanHex.length !== 6) {
    return "255, 255, 255";
  }

  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
};

// 🎨 Configuración del gráfico con colores personalizados
const chartConfig = (colors, gradient) => ({
  backgroundGradientFrom: gradient.from,
  backgroundGradientTo: gradient.to,
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(${hexToRgb(colors.accent || "#F29F05")}, ${opacity})`,
  labelColor: () => colors.text_primary || "#FFF",
  style: { borderRadius: 12 },
  propsForDots: { r: "6", strokeWidth: "3", stroke: colors.accent || "#F29F05" },
});

// 📌 **Estilos**
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#FFFFFF", // ✅ Título siempre blanco
    textShadowColor: "rgba(0, 0, 0, 0.7)", // ✅ Sombra para mejor contraste
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    width: "90%",
    marginBottom: 15,
    padding: 10,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF", // ✅ Asegurar visibilidad
  },
  profitValue: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SnackTradingHistory;
