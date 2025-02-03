import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import YFinanceService from "@/hooks/recipes/YFinanceService";
import SnackLogo from "@/components/snacks/elements/SnackLogo";
import { useTheme } from "@/hooks/useThemeProvider";


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

interface Props {
  trades: TradeData[];
}

const CalculateProfitabilityList: React.FC<Props> = ({ trades }) => {

  const { colors } = useTheme();
  const [profitabilities, setProfitabilities] = useState<number[]>([]);

  useEffect(() => {
    const fetchMarketPrices = async () => {
      const results = await Promise.all(
        trades.map(async (trade) => {
          if (trade.State) {
            try {
              const data = await YFinanceService.getQuote(trade.Symbol);
              const price = typeof data === "string" ? NaN : data.price;
              return isNaN(price) ? 0 : price;
            } catch (error) {
              console.error(`Error al obtener el precio para ${trade.Symbol}:`, error);
              return 0;
            }
          } else {
            return parseFloat(trade.CurrentPrice || "0");
          }
        })
      );
      
      setProfitabilities(
        trades.map((trade, index) => {
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

          const marketPrice = results[index];
          return isBuy
            ? ((marketPrice - avgPrice) / avgPrice) * 100 // Buy: (marketPrice - avgPrice) / avgPrice
            : ((avgPrice - marketPrice) / avgPrice) * 100; // Sell: (avgPrice - marketPrice) / avgPrice
        })
      );
    };

    fetchMarketPrices();
  }, [trades]);

  const totalProfitability =
    profitabilities.length > 0
      ? profitabilities.reduce((sum, val) => sum + val, 0) / profitabilities.length
      : 0;

      return (
        <View style={[styles.container]}> 
          <SnackLogo variant="white" width={40} />
          <View style={styles.row}>
            <MaterialIcons name="trending-up" size={18} color={colors.text} />
            <Text style={[styles.label, { color: colors.text, marginRight: 6 }]}>R. Total:</Text>
            <Text
              style={[
                styles.value,
                { color: totalProfitability >= 0 ? "#4CAF50" : "#F44336" },
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 8,
        backgroundColor: "#000",
        borderRadius: 8,
        shadowColor: "rgba(255, 255, 255, 0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
      },
      label: {
        fontFamily: "Montserrat-Bold",
        marginLeft: 8,
        fontSize: 12,
      },
      value: {
        textAlign: "right",
        fontSize: 14,
        fontWeight: "bold",
      },
    });


export default CalculateProfitabilityList;
