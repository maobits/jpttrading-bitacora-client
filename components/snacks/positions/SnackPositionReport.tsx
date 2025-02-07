import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Card } from "react-native-paper";

const FinancialReport = ({ data }) => {
  if (!data) return <Text style={styles.errorText}>No hay datos disponibles</Text>;

  const { historial, estadoActual } = data;

  // Datos para gráficos de evolución del precio de mercado
  const marketPriceEvolutionData = {
    labels: historial.map((_, index) => `Mov ${index + 1}`),
    datasets: [
      {
        data: historial.map((item) => parseFloat(estadoActual.precioMercado) || 0),
        color: (opacity = 1) => `rgba(34, 139, 230, ${opacity})`, // Azul
        strokeWidth: 2,
      },
    ],
  };

  // Datos para gráficos de rentabilidad
  const profitabilityData = {
    labels: ["Actual", "Cerrada", "Total"],
    datasets: [
      {
        data: [
          parseFloat(estadoActual.rentabilidadActual) || 0,
          parseFloat(estadoActual.rentabilidadTotalCerrada) || 0,
          parseFloat(estadoActual.rentabilidadTotalActiva) || 0,
        ],
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Rojo
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Reporte Financiero Avanzado</Text>

      {/* Sección: Estado Actual - Etiqueta y Valor en una Misma Fila */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📌 Estado Actual</Text>
        {Object.entries(estadoActual).map(([key, value], index) => (
          <View key={key} style={[styles.stateRow, index % 2 === 0 ? styles.rowAlt : null]}>
            <Text style={styles.label}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}:</Text>
            <Text style={styles.value}>{value || "-"}</Text>
          </View>
        ))}
      </Card>

      {/* Sección: Historial de Movimientos con Alternancia de Colores */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🔄 Historial de Movimientos</Text>
        {historial.length > 0 ? (
          historial.map((item, index) => (
            <View key={index} style={[styles.movementContainer, index % 2 === 0 ? styles.movementAlt : null]}>
              <Text style={styles.movementTitle}>Movimiento {index + 1}</Text>
              {Object.entries(item).map(([key, value], subIndex) => (
                <View key={subIndex} style={[styles.movementRow, subIndex % 2 === 0 ? styles.rowAlt : null]}>
                  <Text style={styles.movementLabel}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}:</Text>
                  <Text style={styles.movementValue}>{value}</Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>No hay movimientos registrados</Text>
        )}
      </Card>

      {/* Gráficos */}
      <Card style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>📈 Evolución del Precio de Mercado</Text>
        <LineChart
          data={marketPriceEvolutionData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>

      <Card style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>📊 Rentabilidad</Text>
        <LineChart
          data={profitabilityData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>
    </ScrollView>
  );
};

// Configuración del gráfico
const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

// Estilos mejorados con alternancia de colores y estado actual optimizado
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
  },
  stateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  rowAlt: {
    backgroundColor: "#f1f3f5",
    borderRadius: 4,
  },
  movementContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  movementAlt: {
    backgroundColor: "#e9ecef",
  },
  movementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 6,
  },
  movementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    padding: 6,
  },
  movementLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  movementValue: {
    fontSize: 14,
    color: "#222",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444",
  },
  value: {
    fontSize: 14,
    color: "#222",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default FinancialReport;
