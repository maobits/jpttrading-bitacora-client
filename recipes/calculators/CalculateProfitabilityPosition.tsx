import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons} from "@expo/vector-icons";



interface TradeData {
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
}

interface ProfitabilityResult {
  Symbol: string;
  TradeDate: string;
  NewAveragePrice: number;
  ActiveAllocation: string; // Ahora es string con porcentaje
  ProfitPartial: number;
  ProfitabilityPartial: number;
  ProfitClose: number;
  ProfitabilityClose: number;
  TotalProfit: number;
  TotalProfitability: number;
}

interface Props {
  trade: TradeData;
  viewMode: string; // Agregamos la propiedad viewMode aquí
}

const CalculateProfitabilityPosition: React.FC<{ trade: TradeData, viewMode: String }> = ({
  trade,
  viewMode,
}) => {
  const calculateProfitability = (trade: TradeData): ProfitabilityResult => {
    const prices = JSON.parse(trade.PriceEntry);
    const allocations = JSON.parse(trade.ActiveAllocation);

    let totalQuantity = 1.0; // Iniciamos con 100%
    let averagePrice = parseFloat(prices[0].price);
    let activeAllocationPercentage = 100; // Se inicia en 100%

    // 📌 Procesar adiciones
    for (let i = 1; i < prices.length; i++) {
      if (prices[i].type === "add") {
        let newQuantity =
          totalQuantity *
          (1 + parseFloat(allocations[i].activeAllocation) / 100);
        averagePrice =
          (totalQuantity * averagePrice +
            (newQuantity - totalQuantity) * parseFloat(prices[i].price)) /
          newQuantity;
        totalQuantity = newQuantity;
        activeAllocationPercentage *=
          1 + parseFloat(allocations[i].activeAllocation) / 100;
      }
    }

    let profits: number[] = [];
    let profitabilities: number[] = [];
    let capitalTotal = totalQuantity * averagePrice;

    // 📌 Procesar tomas parciales y cierre total
    for (let i = 0; i < prices.length; i++) {
      if (["decrease", "close"].includes(prices[i].type)) {
        let sellPrice = parseFloat(prices[i].price);
        let sellPercentage = parseFloat(allocations[i].activeAllocation) / 100;
        let quantitySold = totalQuantity * sellPercentage;
        totalQuantity -= quantitySold;

        let profit = quantitySold * (sellPrice - averagePrice);
        let profitability = ((sellPrice - averagePrice) / averagePrice) * 100;

        profits.push(profit);
        profitabilities.push(profitability);

        // 🟢 Actualizar la asignación activa
        activeAllocationPercentage *= 1 - sellPercentage;
      }
    }

    // 📌 Si la operación está cerrada, la asignación activa debe ser 0%
    if (prices[prices.length - 1].type === "close") {
      activeAllocationPercentage = 0;
    }

    let totalProfit = profits.reduce((sum, val) => sum + val, 0);
    let totalProfitability = (totalProfit / capitalTotal) * 100;

    return {
      Symbol: trade.Symbol,
      TradeDate: trade.TradeDate,
      NewAveragePrice: parseFloat(averagePrice.toFixed(2)),
      ActiveAllocation: `${activeAllocationPercentage.toFixed(2)}%`, // Formato de porcentaje
      ProfitPartial: profits.length > 1 ? parseFloat(profits[0].toFixed(3)) : 0,
      ProfitabilityPartial:
        profitabilities.length > 1
          ? parseFloat(profitabilities[0].toFixed(2))
          : 0,
      ProfitClose:
        profits.length > 0
          ? parseFloat(profits[profits.length - 1].toFixed(3))
          : 0,
      ProfitabilityClose:
        profitabilities.length > 0
          ? parseFloat(profitabilities[profitabilities.length - 1].toFixed(2))
          : 0,
      TotalProfit: parseFloat(totalProfit.toFixed(3)),
      TotalProfitability: parseFloat(totalProfitability.toFixed(2)),
    };
  };

  const result = calculateProfitability(trade);

  return (
    <>
    {viewMode === "card" ? (
      <View>
        {/* Rentabilidad Total */}
        <View style={styles.row}>
  <MaterialIcons name="trending-up" size={20} color="white" />
  <Text style={styles.label}>Rentabilidad Total:</Text>
  <Text style={styles.value}>{result.TotalProfitability}%</Text>
</View>

        {/* Asignación Activa */}
        <View style={styles.row}>
          <MaterialIcons name="pie-chart" size={20} color="white" />
          <Text style={[styles.label, { color: "white" }]}>
            Asignación Activa:
          </Text>
          <Text style={[styles.value, { color: "white" }]}>
            {result.ActiveAllocation}
          </Text>
        </View>
      </View>
    ) : (
      <Text style={[styles.tableText, { color: "white" }]}>
        RT {result.TotalProfitability}% / AA {result.ActiveAllocation}
      </Text>
    )}
  </>
  );
};

const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between", // 🔹 Asegura distribución correcta
      marginVertical: 5,
    },
    label: {
      flex: 1, // 🔹 Permite que el texto de la izquierda ocupe espacio
      fontSize: 14,
      fontWeight: "bold",
      marginLeft: 10,
      color: "white"
    },
    value: {
      textAlign: "right", // 🔹 Alinea los valores a la derecha
      fontSize: 16,
      fontWeight: "bold",
      color: "white"
    },
    tableText: {
      fontSize: 14,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 5,
      color: "white"
    },
  });
  
  
  
export default CalculateProfitabilityPosition;
