import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useThemeProvider";
import ProfitabilityCalculatorOpenPosition from "../../../recipes/calculators/ProfitabilityCalculator";

const SnackProfitabilityPosition = ({ position }) => {
  const { colors } = useTheme();
  const [averagePrice, setAveragePrice] = useState("Calculando...");
  const [calculationData, setCalculationData] = useState(null);
  const [activeProfitability, setActiveProfitability] = useState(null);
  const currentPrice = position.currentPrice;
  
  
  useEffect(() => {
    console.log("🔹 Iniciando cálculo del precio promedio...");
    calculateAveragePrice(position, setCalculationData, setAveragePrice);
  }, [position]);

 

  useEffect(() => {
    if (calculationData) {
      console.log("🔹 Calculando rentabilidad de la posición activa...");
      calculateActiveProfitability(calculationData, currentPrice, setActiveProfitability);
    }
  }, [calculationData, currentPrice]);

  return (
    <ProfitabilityCalculatorOpenPosition
    entries={[
      { id: 1, price: "10", date: "2025-01-31T04:46:01.172Z" },
      { id: 2, price: "12", type: "add", date: "2025-01-31T04:46:17.724Z" },
      { id: 3, price: "15", type: "add", date: "2025-01-31T04:46:58.489Z" },
      { id: 4, price: "16", type: "decrease", date: "2025-01-31T04:46:58.489Z" },
      { id: 4, price: "15", type: "decrease", date: "2025-01-31T04:46:58.489Z" }      
    ]}
    allocations={[
      { id: 1, activeAllocation: "100", date: "2025-01-31T04:46:01.172Z" },
      { id: 2, activeAllocation: "20", type: "add", date: "2025-01-31T04:46:17.724Z" },
      { id: 3, activeAllocation: "20", type: "add", date: "2025-01-31T04:46:58.490Z" },
      { id: 4, activeAllocation: "60", type: "decrease", date: "2025-01-31T04:46:58.490Z" },
      { id: 4, activeAllocation: "100", type: "decrease", date: "2025-01-31T04:46:58.490Z" }

    ]}
    totalAllocation={1.44}
    previousAccumulated={1.2}
    currentEntryPrice={16}
    calculatedAveragePrice={11.11111111111111}
    previousPrice={10.333333333333334}
    currentPrice={15}
    direction="Buy"
/>

  
  );
  
};

const calculateAveragePrice = (position, setCalculationData, setAveragePrice) => {
  try {
    console.log("📌 Extrayendo datos de entrada...");
    const priceData = JSON.parse(position.PriceEntry);
    const allocationData = JSON.parse(position.ActiveAllocation);

    console.log("📌 Datos de precio:", priceData);
    console.log("📌 Datos de asignación:", allocationData);

    const filteredPriceData = priceData.filter((item) => item.type !== "decrease");
    const filteredAllocationData = allocationData.filter((item) => item.type !== "decrease");

    console.log("✅ Precios filtrados (sin 'decrease'):", filteredPriceData);
    console.log("✅ Asignaciones filtradas (sin 'decrease'):", filteredAllocationData);

    const totalAllocation = filteredAllocationData.reduce((acc, alloc, index) => {
      const increment = parseFloat(alloc.activeAllocation) / 100;
      return index === 0 ? increment : acc * (1 + increment);
    }, 1);

    console.log("✅ Asignación total acumulada:", totalAllocation);

    const previousAccumulated = filteredAllocationData
      .slice(0, -1)
      .reduce((acc, alloc, index) => {
        const increment = parseFloat(alloc.activeAllocation) / 100;
        return index === 0 ? increment : acc * (1 + increment);
      }, 1);

    console.log("✅ Asignación acumulada previa:", previousAccumulated);

    const previousPrice =
      filteredPriceData.slice(0, -1).reduce((acc, item, index) => {
        const alloc = parseFloat(filteredAllocationData[index].activeAllocation);
        return acc + parseFloat(item.price) * (alloc / 100);
      }, 0) / previousAccumulated;

    console.log("✅ Precio promedio previo:", previousPrice);

    const currentEntryPrice = parseFloat(filteredPriceData[filteredPriceData.length - 1].price);
    console.log("✅ Precio de entrada actual:", currentEntryPrice);

    const calculatedAveragePrice =
      (previousPrice * previousAccumulated +
        currentEntryPrice * (totalAllocation - previousAccumulated)) /
      totalAllocation;

    console.log("🎯 Precio promedio calculado:", calculatedAveragePrice);

    const calculationResults = {
      totalAllocation,
      previousAccumulated,
      currentEntryPrice,
      calculatedAveragePrice,
      previousPrice,
      currentPrice: position.currentPrice,
    };

    console.log("📝 Objeto con los cálculos almacenados:", calculationResults);

    setCalculationData(calculationResults);
    setAveragePrice(calculatedAveragePrice.toFixed(2));
  } catch (error) {
    console.error("❌ Error al calcular el precio promedio:", error);
    setAveragePrice("Error");
  }
};

const calculateActiveProfitability = (calculationData, currentPrice, setActiveProfitability) => {
  try {
    console.log("📌 Calculando rentabilidad de la posición activa...");
    const activeProfit = ((currentPrice - calculationData.calculatedAveragePrice) / calculationData.calculatedAveragePrice) * 100;
    console.log("🎯 Rentabilidad activa calculada:", activeProfit.toFixed(2) + "%");
    setActiveProfitability(activeProfit.toFixed(2) + "%");
  } catch (error) {
    console.error("❌ Error al calcular la rentabilidad de la posición activa:", error);
  }
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  label: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
  value: {
    fontSize: 16,
    fontFamily: "Raleway-Regular",
  },
});

export default SnackProfitabilityPosition;
