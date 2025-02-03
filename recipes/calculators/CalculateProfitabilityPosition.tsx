import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import YFinanceService from "@/hooks/recipes/YFinanceService";

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
  CurrentPrice: string | null;
}

interface ProfitabilityResult {
  Symbol: string;
  TradeDate: string;
  NewAveragePrice: number;
  MarketPrice: number;
  TotalProfit: number;
  TotalProfitability: number;
}

interface Props {
  trade: TradeData;
  viewMode: "card" | "table";
}

const CalculateProfitabilityPosition: React.FC<Props> = ({ trade, viewMode }) => {
  const [currentPrice, setCurrentPrice] = useState<number>(
    trade.State ? 0 : parseFloat(trade.CurrentPrice || "0")
  );

  useEffect(() => {
    if (trade.State) {
      const fetchMarketPrice = async () => {
        try {
          const data = await YFinanceService.getQuote(trade.Symbol);
          const price = typeof data === "string" ? NaN : data.price;
          setCurrentPrice(isNaN(price) ? 0 : price);
        } catch (error) {
          console.error(`Error al obtener el precio para ${trade.Symbol}:`, error);
          setCurrentPrice(0);
        }
      };
      fetchMarketPrice();
    } else {
      setCurrentPrice(parseFloat(trade.CurrentPrice || "0"));
    }
  }, [trade.Symbol, trade.State, trade.CurrentPrice]);

  const calculateProfitability = (trade: TradeData): ProfitabilityResult => {
    const prices = JSON.parse(trade.PriceEntry);
    const allocations = JSON.parse(trade.ActiveAllocation);
    const isBuy = trade.TradeDirection === "Buy";

    let totalQuantity = 1.0;
    let avgPrice = parseFloat(prices[0].price);

    for (let i = 1; i < prices.length; i++) {
      if (prices[i].type === "add") {
        let newQuantity =
          totalQuantity * (1 + parseFloat(allocations[i].activeAllocation) / 100);
        avgPrice =
          (totalQuantity * avgPrice +
            (newQuantity - totalQuantity) * parseFloat(prices[i].price)) /
          newQuantity;
        totalQuantity = newQuantity;
      }
    }

    const totalProfitability = isBuy
      ? ((currentPrice - avgPrice) / avgPrice) * 100
      : ((avgPrice - currentPrice) / avgPrice) * 100;

    const totalProfit = isBuy
      ? totalQuantity * (currentPrice - avgPrice)
      : totalQuantity * (avgPrice - currentPrice);

    return {
      Symbol: trade.Symbol,
      TradeDate: trade.TradeDate,
      NewAveragePrice: parseFloat(avgPrice.toFixed(2)),
      MarketPrice: parseFloat(currentPrice.toFixed(2)),
      TotalProfit: parseFloat(totalProfit.toFixed(3)),
      TotalProfitability: parseFloat(totalProfitability.toFixed(2)),
    };
  };
  
  const result = calculateProfitability(trade);

  return viewMode === "card" ? (
    <View>
      <View style={styles.row}>
        <MaterialIcons name="analytics" size={20} color="white" />
        <Text style={[styles.label, { color: "white" }]}>Precio Promedio:</Text>
        <Text style={[styles.value, { color: "white" }]}>${result.NewAveragePrice}</Text>
      </View>
      <View style={styles.row}>
        <MaterialIcons name="trending-up" size={20} color="white" />
        <Text style={[styles.label, { color: "white" }]}>Rentabilidad Total:</Text>
        <Text
          style={[
            styles.value,
            { color: result.TotalProfitability >= 0 ? "green" : "red" },
          ]}
        >
          {result.TotalProfitability}%
        </Text>
      </View>
    </View>
  ) : (
    <Text style={styles.tableText}>
      RT {result.TotalProfitability}% / AA ${result.NewAveragePrice}
    </Text>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  label: {
    flex: 1,
    fontFamily: "Montserrat-Bold",
    marginLeft: 10,
    fontSize: 14,
  },
  value: {
    textAlign: "right",
    fontSize: 16,
    fontWeight: "bold",
  },
  tableText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
    color: "white",
  },
});

export default CalculateProfitabilityPosition;
