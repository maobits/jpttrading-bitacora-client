import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, Text, Divider, Badge, Button } from "react-native-paper";
import { useTheme } from "@/hooks/useThemeProvider";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import YFinanceService from "@/hooks/recipes/YFinanceService";
import SnackHistoricalSymbol from "./SnackHistoricalSymbol";
import SnackPartialAdd from "./SnackPartialAdd"; // Asegúrate de que este componente esté importado correctamente
import { useAuth } from "@/hooks/recipes/authService"; // ✅ Importar la autenticación
import PositionProfitabilityCalculator from "@/recipes/calculators/PositionProfitabilityCalculator";


// Helper para formatear valores en dólares americanos
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const SnackPositionCard = ({ position, viewMode, onUpdate }) => {
  const { colors, fonts } = useTheme();
  const [currentPrice, setCurrentPrice] = useState("Cargando...");
  const [modalVisible, setModalVisible] = useState(false); // Para el historial
  const [plusModalVisible, setPlusModalVisible] = useState(false); // Para el plus
  const [entryPrice, setEntryPrice] = useState("Cargando...");
  const [averagePrice, setAveragePrice] = useState("Cargando...");
  const [activeAllocation, setActiveAllocation] = useState("No disponible");
  const [priceHistory, setPriceHistory] = useState([]);
  const [activeAllocationHistory, setActiveAllocationHistory] = useState([]);
  const { user } = useAuth(); // ✅ Verifica si hay usuario autenticado
  const [profitability, setProfitability] = useState("Calculando...");


  const isBuy = position.TradeDirection === "Buy";

  // Obtener datos calculados.
  const {
    presentPrice,
    weightedAvgPrice,
    activeAssignment,
    partialProfitability,
    totalProfitability,
  } = PositionProfitabilityCalculator({ position });


  useEffect(() => {
    const fetchProfitability = async () => {
      try {
        const result = await calculateProfitability(position);
        console.log("📊 Resultado de rentabilidad:", result); // 🔍 Ver qué devuelve la función
        setProfitability(result.profitability ?? "No disponible");
      } catch (error) {
        console.error("❌ Error al calcular rentabilidad:", error);
        setProfitability("Error");
      }
    };
  
    fetchProfitability();
  }, [position]);
  

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const data = await YFinanceService.getQuote(position.Symbol);
        const price = typeof data === "string" ? NaN : data.price;
        setCurrentPrice(isNaN(price) ? 0 : price); // Mantén el precio como número
      } catch (error) {
        console.error(
          `Error al obtener el precio para ${position.Symbol}:`,
          error
        );
        setCurrentPrice(0); // Valor predeterminado en caso de error
      }
    };

    const parseDatabaseValues = () => {
      try {
        // Parsear los datos de entrada como JSON
        const priceData = JSON.parse(position.PriceEntry);
        const allocationData = JSON.parse(position.ActiveAllocation);

        // Encontrar el objeto de precio con id === 1
        const priceEntryObject = priceData.find((item) => item.id === 1);
        setEntryPrice(
          priceEntryObject
            ? parseFloat(priceEntryObject.price).toFixed(2)
            : "No disponible"
        );

        // Filtrar los datos para excluir elementos con type === 'decrease'
        const filteredPriceData = priceData.filter(
          (item) => item.type !== "decrease"
        );
        const filteredAllocationData = allocationData.filter(
          (item) => item.type !== "decrease"
        );

        // Calcular el acumulado total actual y previo de forma dinámica
        const totalAllocation = filteredAllocationData.reduce(
          (acc, alloc, index) => {
            const increment = parseFloat(alloc.activeAllocation) / 100;
            return index === 0 ? increment : acc * (1 + increment);
          },
          1
        ); // Acumulado actual

        // Calcular el rendimiento de la posición.
        const result = calculateProfitability(position);


        const previousAccumulated = filteredAllocationData
          .slice(0, -1)
          .reduce((acc, alloc, index) => {
            const increment = parseFloat(alloc.activeAllocation) / 100;
            return index === 0 ? increment : acc * (1 + increment);
          }, 1); // Acumulado previo

        // Precio promedio previo
        const previousPrice =
          filteredPriceData.slice(0, -1).reduce((acc, item, index) => {
            const alloc = parseFloat(
              filteredAllocationData[index].activeAllocation
            );
            return acc + parseFloat(item.price) * (alloc / 100);
          }, 0) / previousAccumulated;

        // Precio de entrada actual
        const currentEntryPrice = parseFloat(
          filteredPriceData[filteredPriceData.length - 1].price
        );

        // Calcular el precio promedio dinámico usando la fórmula
        const calculatedAveragePrice =
          (previousPrice * previousAccumulated +
            currentEntryPrice * (totalAllocation - previousAccumulated)) /
          totalAllocation;

        // Calcular la asignación activa acumulativa
        setActiveAllocation((totalAllocation * 100).toFixed(2) + "%");

        // Calcular el precio promedio final y redondear a 2 decimales
        setAveragePrice(calculatedAveragePrice.toFixed(2));
      } catch (error) {
        // Manejo de errores
        console.error("Error al parsear datos:", error);
        setEntryPrice("No disponible");
        setAveragePrice("No disponible");
        setActiveAllocation("No disponible");
      }
    };

    fetchCurrentPrice();
    parseDatabaseValues();

    fetchCurrentPrice();
    parseDatabaseValues();
  }, [position.Symbol, position.PriceEntry, position.ActiveAllocation]);

  useEffect(() => {
    const parseDatabaseValues = () => {
      try {
        // Convertir los datos en JSON si vienen como cadenas
        const priceData = JSON.parse(position.PriceEntry);
        const allocationData = JSON.parse(position.ActiveAllocation);

        // Configurar el historial de precios
        const formattedPriceHistory = priceData.map((item) => ({
          id: item.id,
          price: parseFloat(item.price).toFixed(2), // Convertir a decimal con dos decimales
          date: new Date(item.date).toISOString(), // Asegurarse de que las fechas sean válidas
        }));
        setPriceHistory(formattedPriceHistory);

        // Configurar el historial de asignación activa
        const formattedAllocationHistory = allocationData.map((item) => ({
          id: item.id,
          activeAllocation: parseFloat(item.activeAllocation).toFixed(2), // Convertir a decimal
          date: new Date(item.date).toISOString(), // Formatear la fecha
        }));
        setActiveAllocationHistory(formattedAllocationHistory);
      } catch (error) {
        console.error("Error al procesar los datos del historial:", error);
      }
    };

    parseDatabaseValues();
  }, [position.PriceEntry, position.ActiveAllocation]);

  return (
    <>
      <Card style={[styles.card, { backgroundColor: colors.background }]}>
        <Card.Title
          title={position.Symbol}
          titleStyle={{
            color: colors.primary,
            fontFamily: fonts.Montserrat.extraBold,
            fontSize: 20,
          }}
          right={(props) => (
            <View style={styles.rightContainer}>
             
              <View style={styles.historyContainer}>
                <MaterialIcons
                  name="calendar-today"
                  size={16}
                  color={colors.text}
                  style={styles.historyIcon}
                />
                <Button
                  mode="text"
                  onPress={() => setModalVisible(true)} // Abre el modal del historial
                  labelStyle={{
                    color: colors.text,
                    fontFamily: fonts.Raleway.medium,
                    fontSize: 12,
                  }}
                  style={styles.historyButton}
                >
                  Historial
                </Button>
                {/* Botón Plus */}
                {user && (
                  <TouchableOpacity
                    style={[
                      styles.plusButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setPlusModalVisible(true)}
                  >
                    <MaterialIcons
                      name="add"
                      size={20}
                      color={colors.text_black}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
        <Card.Content>
          <View style={styles.row}>
            <MaterialIcons name="price-check" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Precio de Entrada:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatCurrency(parseFloat(entryPrice || "0"))}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="analytics" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Precio Promedio:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {"$" + averagePrice}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons
              name="monetization-on"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              Precio Actual:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatCurrency(currentPrice)} {/* Formateo solo al mostrar */}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="trending-down" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Stop Loss:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatCurrency(parseFloat(position.StopLoss))}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="trending-up" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Take Profit 1:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatCurrency(parseFloat(position.TakeProfit))}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="insights" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Take Profit 2:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatCurrency(parseFloat(position.TakeProfit2))}
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {/* Agregar el componente de rentabilidad después de la fecha de operación */}
          <View style={styles.row}>
            <MaterialIcons name="date-range" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Retabilidad total
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
            {totalProfitability.toFixed(2)}%
            </Text>
          </View>

           {/* Agregar el componente de rentabilidad después de la fecha de operación */}
           <View style={styles.row}>
            <MaterialIcons name="date-range" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Asignación activa
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
            {activeAssignment}%
           
            </Text>
          </View>
          

          <View style={styles.row}>
            {position.State ? (
              <MaterialCommunityIcons
                name="checkbox-blank-circle"
                size={20}
                color="green"
              />
            ) : (
              <MaterialIcons name="lock" size={20} color={colors.secondary} />
            )}
            <View
  style={{
    backgroundColor: isBuy ? colors.primary : colors.secondary,
    borderRadius: 5, // Bordes redondeados
    paddingVertical: 2,
    paddingHorizontal: 8, // Ajuste interno para que no se vea pegado
    marginLeft: 8, // Espaciado a la izquierda
  }}
>
  <Text style={[styles.label, { color: colors.text_black }]}>
    {isBuy ? "COMPRA" : "VENTA"}
  </Text>
</View>

            
          </View>
        </Card.Content>
      </Card>

      {/* Modal para Mostrar Historial */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.modalText, { color: colors.text_black }]}>
            Historial de {position.Symbol}
          </Text>
          <SnackHistoricalSymbol
            symbol={position.Symbol}
            period="1mo"
            priceHistory={priceHistory}
            activeAllocationHistory={activeAllocationHistory}
          />
          <Button
            mode="contained"
            onPress={() => setModalVisible(false)}
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: "#FFFFFF" }}
          >
            Cerrar
          </Button>
        </ScrollView>
      </Modal>

      {/* Modal para el Plus */}
      <Modal
        visible={plusModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPlusModalVisible(false)}
      >
        <ScrollView
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <SnackPartialAdd
            positionId={position.id}
            onClose={() => {
              console.log("📌 Cierre de modal y recarga de posiciones"); // 🔹 Log de verificación
              setPlusModalVisible(false);
              if (onUpdate) {
                onUpdate(); // ✅ Llama `onUpdate` solo si está definido
              } else {
                console.warn(
                  "⚠️ onUpdate no está definido en SnackPositionCard"
                );
              }
            }}
          />
          <Button
            mode="contained"
            onPress={() => setPlusModalVisible(false)}
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: "#FFFFFF" }}
          >
            Cerrar
          </Button>
        </ScrollView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 12,
    elevation: 4,
  },
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
    fontFamily: "Raleway-Regular",
    fontSize: 16,
  },
  divider: {
    marginVertical: 10,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  historyIcon: {
    marginRight: 2,
  },
  historyButton: {
    padding: 0,
  },
  plusButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 20,
    fontFamily: "Raleway-Bold",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 10,
  },
});

export default SnackPositionCard;
