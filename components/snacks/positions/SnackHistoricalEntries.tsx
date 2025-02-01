import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@/hooks/useThemeProvider";

interface SnackHistoricalEntriesProps {
  priceHistory: { id: number; price: string; date: string }[];
  activeAllocationHistory: {
    id: number;
    activeAllocation: string;
    date: string;
  }[];
}

const SnackHistoricalEntries: React.FC<SnackHistoricalEntriesProps> = ({
  priceHistory,
  activeAllocationHistory,
}) => {
  const { colors, fonts } = useTheme();
  const [selectedPoint, setSelectedPoint] = useState<{
    date: string;
    value: number;
  } | null>(null);
  const [weightedAveragePrice, setWeightedAveragePrice] = useState("N/A");
  const [totalActivePercentage, setTotalActivePercentage] = useState("N/A");

  useEffect(() => {
    // Calcular el promedio ponderado del precio
    const calculateWeightedAverage = () => {
      try {
        const totalWeightedPrice = priceHistory.reduce((acc, item) => {
          const allocation = activeAllocationHistory.find(
            (alloc) => alloc.id === item.id
          );
          const proportion = allocation
            ? parseFloat(allocation.activeAllocation)
            : 0;
          return acc + parseFloat(item.price) * proportion;
        }, 0);

        const totalProportion = activeAllocationHistory.reduce(
          (acc, alloc) => acc + parseFloat(alloc.activeAllocation),
          0
        );

        setWeightedAveragePrice(
          totalProportion > 0
            ? (totalWeightedPrice / totalProportion).toFixed(2)
            : "N/A"
        );
      } catch (error) {
        console.error("Error al calcular el promedio ponderado:", error);
        setWeightedAveragePrice("N/A");
      }
    };

    // Calcular el porcentaje acumulado de asignación activa
    const calculateTotalAllocation = () => {
      try {
        const totalAllocation = activeAllocationHistory.reduce(
          (acc, alloc, index) => {
            const increment = parseFloat(alloc.activeAllocation) / 100;
            return index === 0 ? increment : acc * (1 + increment);
          },
          1
        );
        setTotalActivePercentage((totalAllocation * 100).toFixed(2));
      } catch (error) {
        console.error(
          "Error al calcular el porcentaje acumulado de asignación activa:",
          error
        );
        setTotalActivePercentage("N/A");
      }
    };

    calculateWeightedAverage();
    calculateTotalAllocation();
  }, [priceHistory, activeAllocationHistory]);

  const priceData = priceHistory.map((item) => parseFloat(item.price));
  const allocationData = activeAllocationHistory.map((item) =>
    parseFloat(item.activeAllocation)
  );
  const labels = priceHistory.map((item) =>
    new Date(item.date).toLocaleDateString("es-CO", {
      month: "short",
      day: "2-digit",
    })
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: priceData,
              color: (opacity = 1) => `rgba(242, 183, 5, ${opacity})`, // Color para precios
            },
            {
              data: allocationData,
              color: (opacity = 1) => `rgba(34, 193, 195, ${opacity})`, // Color para asignación activa
            },
          ],
        }}
        width={Dimensions.get("window").width - 40}
        height={220}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 2,
          color: (opacity = 1) => colors.primary,
          labelColor: () => colors.text,
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: colors.primary,
          },
        }}
        bezier
        onDataPointClick={(data) => {
          const date = labels[data.index];
          setSelectedPoint({ date, value: data.value });
        }}
        style={{ marginVertical: 8, borderRadius: 10 }}
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

      <View
        style={[styles.tableContainer, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.tableHeader, { color: colors.primary }]}>
          Historial de Precios
        </Text>
        <Text style={[styles.tableSubHeader, { color: colors.text }]}>
          Promedio Ponderado: ${weightedAveragePrice}
        </Text>
        {priceHistory.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.tableCellLabel, { color: colors.text }]}>
              Fecha:
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.primary }]}>
              ${item.price}
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.text }]}>
              {new Date(item.date).toLocaleDateString("es-CO")}
            </Text>
          </View>
        ))}

        <Text style={[styles.tableHeader, { color: colors.primary }]}>
          Historial de Asignación Activa
        </Text>
        <Text style={[styles.tableSubHeader, { color: colors.text }]}>
          Porcentaje Total: {totalActivePercentage}%
        </Text>
        {activeAllocationHistory.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.tableCellLabel, { color: colors.text }]}>
              Fecha:
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.primary }]}>
              {item.activeAllocation}%
            </Text>
            <Text style={[styles.tableCellValue, { color: colors.text }]}>
              {new Date(item.date).toLocaleDateString("es-CO")}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
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
    alignSelf: "center",
  },
  tableHeader: {
    fontFamily: "Raleway-Bold",
    fontSize: 18,
    marginBottom: 10,
  },
  tableSubHeader: {
    fontFamily: "Raleway-Regular",
    fontSize: 16,
    marginBottom: 10,
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

export default SnackHistoricalEntries;
