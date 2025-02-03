import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SnackLogo from "@/components/snacks/elements/SnackLogo"; // ✅ Importación del Logo

interface TradeData {
  id: number;
  Symbol: string;
  PriceEntry: string;
  ActiveAllocation: string;
  TradeDate: string;
  TradeDirection: string;
  State: boolean;
}

interface Props {
  positions: TradeData[];
  viewMode: string;
}

const CalculatePortfolioProfitability: React.FC<Props> = ({ positions, viewMode }) => {
  const calculateProfitability = (trade: TradeData) => {
    try {
      const prices = JSON.parse(trade.PriceEntry);
      const allocations = JSON.parse(trade.ActiveAllocation);
      const isBuy = trade.TradeDirection === "Buy"; // ✅ Detectamos si es Buy o Sell

      let totalQuantity = 1.0;
      let averagePrice = parseFloat(prices[0].price);

      for (let i = 1; i < prices.length; i++) {
        if (prices[i].type === "add") {
          let newQuantity = totalQuantity * (1 + parseFloat(allocations[i].activeAllocation) / 100);
          averagePrice =
            (totalQuantity * averagePrice +
              (newQuantity - totalQuantity) * parseFloat(prices[i].price)) /
            newQuantity;
          totalQuantity = newQuantity;
        }
      }

      let profits: number[] = [];
      let capitalTotal = totalQuantity * averagePrice;

      for (let i = 0; i < prices.length; i++) {
        if (["decrease", "close"].includes(prices[i].type)) {
          let sellPrice = parseFloat(prices[i].price);
          let sellPercentage = parseFloat(allocations[i].activeAllocation) / 100;
          let quantitySold = totalQuantity * sellPercentage;
          totalQuantity -= quantitySold;

          let profit = isBuy
            ? quantitySold * (sellPrice - averagePrice) // ✅ Buy (precio actual - promedio)
            : quantitySold * (averagePrice - sellPrice); // ✅ Sell (promedio - precio actual)

          profits.push(profit);
        }
      }

      let totalProfit = profits.reduce((sum, val) => sum + val, 0);
      let totalProfitability = (totalProfit / capitalTotal) * 100;

      return totalProfitability;
    } catch (error) {
      console.error("Error en el cálculo de rentabilidad:", error);
      return 0;
    }
  };

  const totalProfitability =
    positions.length > 0
      ? positions.reduce((sum, trade) => sum + calculateProfitability(trade), 0) / positions.length
      : 0;

  return (
    <View style={styles.container}>
      {/* Logo y Cantidad de Posiciones */}
      <View style={styles.topRow}>
        <SnackLogo variant="white" width={35} />  
        <Text style={styles.cantText}>Cant. {positions.length}</Text>
      </View>

      {/* Rentabilidad del Portafolio */}
      <View style={styles.row}>
        <MaterialIcons name="trending-up" size={16} color="white" />
        <Text style={styles.label}>PProf:</Text>
        <Text
          style={[
            styles.value,
            { color: totalProfitability >= 0 ? "green" : "red" }, // ✅ Indicador de color
          ]}
        >
          {totalProfitability.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 12,
    paddingVertical: 6,  // 🔹 Reducción de margen superior e inferior
    borderRadius: 8,
    marginVertical: 5,   // 🔹 Más compacto
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  cantText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,  // 🔹 Espaciado del logo
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,  // 🔹 Menos espacio
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  value: {
    textAlign: "right",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default CalculatePortfolioProfitability;
