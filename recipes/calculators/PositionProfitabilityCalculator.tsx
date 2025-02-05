import { useState, useEffect } from "react";
import YFinanceService from "@/hooks/recipes/YFinanceService";

const PositionProfitabilityCalculator = ({ position }) => {
  const [presentPrice, setCurrentPrice] = useState(0);
  const [weightedAvgPrice, setWeightedAvgPrice] = useState(0);
  const [partialProfitability, setPartialProfitability] = useState(0);
  const [activeAssignment, setActiveAssignment] = useState(0);
  const [totalProfitability, setTotalProfitability] = useState(0);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        if (!position.State) {
          setCurrentPrice(parseFloat(position.SavedPrice));
          return;
        }
        const data = await YFinanceService.getQuote(position.Symbol);
        const price = typeof data === "string" ? NaN : data.price;
        setCurrentPrice(isNaN(price) ? 0 : price);
      } catch (error) {
        console.error(
          `Error al obtener el precio para ${position.Symbol}:`,
          error
        );
        setCurrentPrice(0);
      }
    };
    fetchCurrentPrice();
  }, [position]);

  useEffect(() => {
    if (!position) return;

    try {
      const priceEntries = JSON.parse(position.PriceEntry);
      const allocations = JSON.parse(position.ActiveAllocation);

      let totalCost = 0;
      let totalAllocation = 0;
      let previousAllocation = 0;
      let newActiveAllocation = 0;
      let grossProfitPartial = 0;
      let grossProfitTotal = 0;
      let maxAllocation = 0;

      // Calcular precio promedio ponderado
      priceEntries.forEach((entry) => {
        const allocation = allocations.find((a) => a.id === entry.id);
        if (!allocation) return;

        const price = parseFloat(entry.price);
        const activeAllocation = parseFloat(allocation.activeAllocation);
        const type = entry.type || "initial";

        if (type === "initial") {
          totalAllocation = activeAllocation;
          totalCost = price * activeAllocation;
        } else if (type === "add") {
          const newAllocation = previousAllocation * (activeAllocation / 100);
          totalAllocation += newAllocation;
          totalCost += price * newAllocation;
        }

        previousAllocation = totalAllocation;
        maxAllocation = Math.max(maxAllocation, totalAllocation);
      });

      const weightedAvg = totalCost / totalAllocation;
      setWeightedAvgPrice(weightedAvg);

      // Calcular rentabilidad total desde el inicio
      const factorActive =
        (totalAllocation / maxAllocation) *
        (position.TradeDirection === "Buy"
          ? (presentPrice - weightedAvg) / weightedAvg
          : (weightedAvg - presentPrice) / weightedAvg);
      let totalProfit = factorActive;

      // Calcular rentabilidad parcial y total incluyendo tomas parciales
      priceEntries.forEach((entry) => {
        const allocation = allocations.find((a) => a.id === entry.id);
        if (!allocation) return;

        const price = parseFloat(entry.price);
        const activeAllocation = parseFloat(allocation.activeAllocation);
        const type = entry.type;

        if (type === "decrease") {
          const decreaseAllocation =
            previousAllocation * (activeAllocation / 100);
          newActiveAllocation = previousAllocation - decreaseAllocation;
          const partialProfit =
            position.TradeDirection === "Buy"
              ? (price - weightedAvg) / weightedAvg
              : (weightedAvg - price) / weightedAvg;
          const factorPartial =
            ((previousAllocation - newActiveAllocation) / maxAllocation) *
            partialProfit;
          const factorActivePosition =
            (newActiveAllocation / maxAllocation) *
            (position.TradeDirection === "Buy"
              ? (presentPrice - weightedAvg) / weightedAvg
              : (weightedAvg - presentPrice) / weightedAvg);
          grossProfitPartial += factorPartial + factorActivePosition;
        } else if (type === "close") {
          const closeAllocation = newActiveAllocation;
          newActiveAllocation = 0;
          const closeProfit =
            (position.TradeDirection === "Buy"
              ? price - weightedAvg
              : weightedAvg - price) / weightedAvg;
          grossProfitTotal += closeProfit;
        }
      });

      totalProfit += grossProfitPartial;
      setActiveAssignment(newActiveAllocation || totalAllocation);
      setPartialProfitability(grossProfitPartial);
      setTotalProfitability(totalProfit);

      console.log(`\n[PROFITABILITY REPORT]`);
      console.log(`----------------------------------`);
      console.log(`Símbolo: ${position.Symbol}`);
      console.log(`Precio Promedio Ponderado: ${weightedAvg}`);
      console.log(
        `Asignación Activa Actual: ${
          newActiveAllocation > 0 ? newActiveAllocation : totalAllocation
        }`
      );
      console.log(`Rentabilidad Parcial: ${grossProfitPartial}`);
      console.log(`Rentabilidad Total: ${totalProfit}`);
      console.log(`----------------------------------\n`);
    } catch (error) {
      console.error("Error en el cálculo de rentabilidad:", error);
    }
  }, [position, presentPrice]);

  return {
    presentPrice,
    weightedAvgPrice,
    activeAssignment,
    partialProfitability,
    totalProfitability,
  };
};

export default PositionProfitabilityCalculator;
