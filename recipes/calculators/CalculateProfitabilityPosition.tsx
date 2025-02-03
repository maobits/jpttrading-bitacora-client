import React from "react";

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
  ActiveAllocation: string;  // Ahora es string con porcentaje
  ProfitPartial: number;
  ProfitabilityPartial: number;
  ProfitClose: number;
  ProfitabilityClose: number;
  TotalProfit: number;
  TotalProfitability: number;
}

const CalculateProfitabilityPosition: React.FC<{ trade: TradeData }> = ({ trade }) => {
  const calculateProfitability = (trade: TradeData): ProfitabilityResult => {
    const prices = JSON.parse(trade.PriceEntry);
    const allocations = JSON.parse(trade.ActiveAllocation);

    let totalQuantity = 1.0; // Iniciamos con 100%
    let averagePrice = parseFloat(prices[0].price);
    let activeAllocationPercentage = 100; // Se inicia en 100%

    // 📌 Procesar adiciones
    for (let i = 1; i < prices.length; i++) {
      if (prices[i].type === "add") {
        let newQuantity = totalQuantity * (1 + parseFloat(allocations[i].activeAllocation) / 100);
        averagePrice =
          (totalQuantity * averagePrice + (newQuantity - totalQuantity) * parseFloat(prices[i].price)) /
          newQuantity;
        totalQuantity = newQuantity;
        activeAllocationPercentage *= (1 + parseFloat(allocations[i].activeAllocation) / 100);
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
        activeAllocationPercentage *= (1 - sellPercentage);
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
      ProfitabilityPartial: profitabilities.length > 1 ? parseFloat(profitabilities[0].toFixed(2)) : 0,
      ProfitClose: profits.length > 0 ? parseFloat(profits[profits.length - 1].toFixed(3)) : 0,
      ProfitabilityClose: profitabilities.length > 0 ? parseFloat(profitabilities[profitabilities.length - 1].toFixed(2)) : 0,
      TotalProfit: parseFloat(totalProfit.toFixed(3)),
      TotalProfitability: parseFloat(totalProfitability.toFixed(2)),
    };
  };

  const result = calculateProfitability(trade);

  return (
    <div>
      <h2>Resultados de Rentabilidad para {result.Symbol}</h2>
      <p>Fecha de la operación: {result.TradeDate}</p>
      <p>Nuevo Precio Promedio: ${result.NewAveragePrice}</p>
      <p>Ganancia Toma Parcial: ${result.ProfitPartial}</p>
      <p>Rentabilidad Toma Parcial: {result.ProfitabilityPartial}%</p>
      <p>Ganancia Cierre Total: ${result.ProfitClose}</p>
      <p>Rentabilidad Cierre Total: {result.ProfitabilityClose}%</p>
      <p>Ganancia Total: ${result.TotalProfit}</p>
      <p>Rentabilidad Total: {result.TotalProfitability}%</p>
      <h3>Asignación Activa:</h3>
      <p>{result.ActiveAllocation}</p>
    </div>
  );
};

export default CalculateProfitabilityPosition;
