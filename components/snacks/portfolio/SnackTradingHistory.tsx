import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Text, Card } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@/hooks/useThemeProvider";

const SnackTradingHistory = ({ portfolioResult = {}, showClosed = false }) => {
  const { colors } = useTheme();
  const { groupedResults = {}, estadoGeneral = {} } = portfolioResult;

  if (!portfolioResult || Object.keys(portfolioResult).length === 0) {
    console.warn("⚠ WARN: No se han recibido datos en portfolioResult.");
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No hay datos disponibles para mostrar el historial del portafolio.
        </Text>
      </View>
    );
  }

  console.log("🔍 Debug: Estado General ->", estadoGeneral);
  console.log("🔍 Debug: Ciclos detectados ->", Object.keys(groupedResults));

  // 📊 Extraer y procesar datos de todos los ciclos
  const ciclos = Object.keys(groupedResults);
  const rentabilidades = [];
  const etiquetasCiclos = [];

  ciclos.forEach((cycle) => {
    const { estadoActual = {} } = groupedResults[cycle];

    // Se selecciona la rentabilidad según la vista activa/cerrada
    const rentabilidad = showClosed
      ? parseFloat(estadoActual?.rentabilidadTotalCerrada || "0")
      : parseFloat(estadoActual?.rentabilidadTotalActiva || "0");

    rentabilidades.push(rentabilidad);
    etiquetasCiclos.push(cycle);
  });

  console.log("📈 Rentabilidades procesadas:", rentabilidades);

  // 📉 Datos para la gráfica
  const chartData = {
    labels: etiquetasCiclos, // Ciclos en el eje X
    datasets: [
      {
        data: rentabilidades, // Rentabilidad en cada ciclo
        color: (opacity = 1) =>
          `rgba(${hexToRgb(colors.primary || "#F29F05")}, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Resumen de Rentabilidad por Ciclo</Text>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title
          title={showClosed ? "Rentabilidad Cerrada" : "Rentabilidad Activa"}
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          <Text style={[styles.profitValue, { color: colors.primary }]}>
            {showClosed
              ? `Rentabilidad total cerrada: ${estadoGeneral.rentabilidadTotalCerrada}%`
              : `Rentabilidad activa total: ${estadoGeneral.rentabilidadTotalActiva}%`}
          </Text>
        </Card.Content>
      </Card>

      {/* 📈 Gráfico de rentabilidad por ciclo */}
      {rentabilidades.length > 0 ? (
        <LineChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={250}
          yAxisLabel="%"
          chartConfig={chartConfig(colors)}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No hay suficientes datos históricos para mostrar el gráfico.
          </Text>
        </View>
      )}

{showClosed &&
  ciclos.map((cycle) => {
    const { estadoActual = {} } = groupedResults[cycle];
    return (
      <Card key={cycle} style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title={`📅 Ciclo: ${cycle}`} titleStyle={styles.cardTitle} />
        <Card.Content>
          <Text style={styles.detailsText}>
            📌 Precio de Mercado: <Text style={styles.boldText}>${estadoActual.precioMercado}</Text>
          </Text>
          <Text style={styles.detailsText}>
            🏷 Precio Promedio: <Text style={styles.boldText}>${estadoActual.precioPromedio}</Text>
          </Text>
          <Text style={styles.detailsText}>
            📊 Rentabilidad Activa: <Text style={styles.boldText}>{estadoActual.rentabilidadTotalActiva}%</Text>
          </Text>
          <Text style={styles.detailsText}>
            🔄 Rentabilidad Acumulada de Tomas:{" "}
            <Text style={styles.boldText}>{estadoActual.rentabilidadAcumuladaTomas}%</Text>
          </Text>
        </Card.Content>
      </Card>
    );
  })}
    </ScrollView>
  );
};

// 🔹 Función para convertir HEX a RGB
const hexToRgb = (hex) => {
  if (!hex || typeof hex !== "string") {
    return "255, 255, 255";
  }
  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
  if (cleanHex.length !== 6) {
    return "255, 255, 255";
  }
  const bigint = parseInt(cleanHex, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
};

// 🎨 Configuración del gráfico
const chartConfig = (colors) => ({
  backgroundGradientFrom: colors.background || "#121212",
  backgroundGradientTo: colors.background_dark || "#000000",
  decimalPlaces: 2,
  color: (opacity = 1) =>
    `rgba(${hexToRgb(colors.primary || "#F29F05")}, ${opacity})`,
  labelColor: () => colors.text || "#FFF",
  style: { borderRadius: 12 },
  propsForDots: {
    r: "6",
    strokeWidth: "3",
    stroke: colors.accent || "#F29F05",
  },
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
    color: "#FFFFFF",
  },
  card: {
    width: "90%",
    marginBottom: 15,
    padding: 10,
    borderRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
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
  detailsText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  boldText: {
    fontWeight: "bold",
    color: "#F29F05",
  },
});

export default SnackTradingHistory;
