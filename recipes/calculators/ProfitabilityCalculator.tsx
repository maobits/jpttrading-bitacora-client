import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Usar MaterialCommunityIcons

interface Entry {
  id: number;
  price: string;
  date: string;
  type?: string;
}

interface Allocation {
  id: number;
  activeAllocation: string;
  date: string;
  type?: string;
}

interface ProfitabilityProps {
  entries: Entry[];
  allocations: Allocation[];
  totalAllocation: number;
  previousAccumulated: number;
  currentEntryPrice: number;
  calculatedAveragePrice: number;
  previousPrice: number;
  currentPrice: number;
  direction: "Buy" | "Sell"; // Se define explícitamente como "buy" o "sell" para evitar valores inválidos
}

const calculateTotalActiveAllocation = (allocations: Allocation[]) => {
  return allocations.reduce((acc, alloc, index) => {
    const increment = parseFloat(alloc.activeAllocation) / 100;
    if (alloc.type === "add") {
      return index === 0 ? increment : acc * (1 + increment);
    } else if (alloc.type === "decrease") {
      return acc * (1 - increment);
    }
    return acc;
  }, 1) * 100;
};

const ProfitabilityCalculatorOpenPosition: React.FC<ProfitabilityProps> = ({
  entries,
  allocations,
  totalAllocation,
  previousAccumulated,
  currentEntryPrice,
  calculatedAveragePrice,
  previousPrice,
  currentPrice,
  direction
}) => {

  // Helper function to calculate weighted average price
  const calculateAveragePrice = (entries: Entry[], allocations: Allocation[]) => {
    let totalValue = 0;
    let totalAlloc = 0;
    for (let i = 0; i < entries.length; i++) {
      const entry = parseFloat(entries[i].price);
      const allocation = parseFloat(allocations[i].activeAllocation);
      totalValue += entry * allocation;
      totalAlloc += allocation;
    }
    const averagePrice = totalValue / totalAlloc;
    console.log(`Step 1 - Calculating Average Price:`);
    console.log(`  Total Value: ${totalValue}`);
    console.log(`  Total Allocation: ${totalAlloc}`);
    console.log(`  Calculated Average Price: ${averagePrice}`);
    return averagePrice;
  };

  // Function to calculate Active Position Profitability
  const calculateActiveProfitability = (currentPrice: number, averagePrice: number, direction: "buy" | "sell") => {
    const profitability = direction === "Buy"
      ? ((currentPrice - averagePrice) / averagePrice) * 100
      : ((averagePrice - currentPrice) / averagePrice) * 100;
  
    console.log(`Step 2 - Calculating Active Profitability:`);
    console.log(`  Direction: ${direction}`);
    console.log(`  Current Price: ${currentPrice}`);
    console.log(`  Average Price: ${averagePrice}`);
    console.log(`  Active Profitability: ${profitability}%`);
    
    return profitability;
  };

  // Function to calculate Combined Profitability considering all partial decreases
  const calculateCombinedProfitability = (
    activeProfitability: number,
    allocations: Allocation[],
    averagePrice: number,
    totalAllocation: number,
    direction: "Buy" | "Sell"
  ) => {
    let closedProfitability = 0;
    let closedAllocation = 0;
  
    allocations.forEach((allocation) => {
      if (allocation.type === "decrease") {
        const closedPrice = parseFloat(entries[allocation.id - 1].price);
        const closedProfit = direction === "Buy"
          ? ((closedPrice - averagePrice) / averagePrice) * 100
          : ((averagePrice - closedPrice) / averagePrice) * 100;
  
        closedProfitability += closedProfit * (parseFloat(allocation.activeAllocation) / 100);
        closedAllocation += parseFloat(allocation.activeAllocation) / 100;
      }
    });
  
    const activeAllocation = 1 - closedAllocation;
    const combinedProfitability =
      closedProfitability + activeProfitability * activeAllocation;
  
    console.log(`Step 3 - Calculating Combined Profitability:`);
    console.log(`  Direction: ${direction}`);
    console.log(`  Active Profitability: ${activeProfitability}%`);
    console.log(`  Closed Profitability: ${closedProfitability}%`);
    console.log(`  Active Allocation: ${activeAllocation}%`);
    console.log(`  Closed Allocation: ${closedAllocation}%`);
    console.log(`  Combined Profitability: ${combinedProfitability}%`);
  
    return combinedProfitability;
  };
  // Rentabilidad total activa
  const activeProfitability = calculateActiveProfitability(currentPrice, calculatedAveragePrice, direction);

  // Rentabilidad total combinada
  const combinedProfitability = calculateCombinedProfitability(activeProfitability, allocations, calculatedAveragePrice, totalAllocation, direction);

  console.log(`Step 4 - Final Rentabilities Calculated:`);
  console.log(`  Active Profitability: ${activeProfitability.toFixed(2)}%`);
  console.log(`  Combined Profitability: ${combinedProfitability.toFixed(2)}%`);

  const activeAllocation = calculateTotalActiveAllocation(allocations);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MaterialCommunityIcons name="chart-line" size={20} color="#fff" />
        <Text style={styles.label}>Rentabilidad Total Activa:</Text>
        <Text style={styles.value}>{activeProfitability.toFixed(2)}%</Text>
      </View>
      <View style={styles.row}>
        <MaterialCommunityIcons name="chart-line" size={20} color="#fff" />
        <Text style={styles.label}>Rentabilidad Total Combinada:</Text>
        <Text style={styles.value}>{combinedProfitability.toFixed(2)}%</Text>
      </View>
      <View style={styles.row}>
        <MaterialCommunityIcons name="chart-donut-variant" size={20} color="#fff" />
        <Text style={styles.label}>Asignación activa:</Text>
        <Text style={styles.value}>{activeAllocation.toFixed(2)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A', // Fondo oscuro
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    color: "#fff", // Texto claro
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  value: {
    color: "#fff", // Texto claro
    fontSize: 16,
    marginLeft: 5,
  },
});

export default ProfitabilityCalculatorOpenPosition;
