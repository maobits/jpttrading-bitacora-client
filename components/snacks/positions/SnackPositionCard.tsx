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
import { fetchPositionProfitability } from "@/recipes/calculators/PositionProfitabilityCalculator";
import SnackPositionReport from "./SnackPositionReport";



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
  const [priceHistory, setPriceHistory] = useState([]);
  const [activeAllocationHistory, setActiveAllocationHistory] = useState([]);
  const { user } = useAuth(); // ✅ Verifica si hay usuario autenticado
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [rentabilidadData, setRentabilidadData] = useState(null);
  const [positionData, setPositionData] = useState(null);

  const isBuy = position.TradeDirection === "Buy";

  // Datos de la calculadora de rentabilidad.
  const [TotalProfitability, setTotalProfitability] = useState<string | null>(
    null
  );

  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);

  const [AveragePrice, setAveragePrice] = useState<string | null>(null);

  const [StatusPosition, setStatusPosition] = useState<string | null>(null);

  const [totalReturnClosedPosition, setTotalReturnClosedPosition] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState<boolean>(true);

  const handleUpdateAfterPartialAdd = async () => {
    console.log("📌 Recargando la página...");
    setPlusModalVisible(false);
    window.location.reload();
  };

  useEffect(() => {
    const obtenerRentabilidad = async () => {
      const result = await fetchPositionProfitability(position);
      
      setPositionData(result);

      setTotalProfitability(
        result?.estadoActual?.rentabilidadTotalActiva ?? "No disponible"
      );
      setActiveAssignment(
        result?.estadoActual?.porcentajeAsignacionActiva ?? "No disponible"
      );
      setAveragePrice(result?.estadoActual?.precioPromedio ?? "No disponible");

      setTotalReturnClosedPosition(
        result?.historial?.find((item: any) => item.tipo === "cierre_total")
          ?.rentabilidadTotal ?? "No disponible"
      );

      setStatusPosition(position?.Status ?? "No disponible");

      setLoading(false);
    };

    obtenerRentabilidad();
  }, []);

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
      } catch (error) {
        // Manejo de errores
        console.error("Error al parsear datos:", error);
        setEntryPrice("No disponible");
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
                      { backgroundColor: colors.primary, marginRight: 10},
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
              {entryPrice}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="analytics" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Precio Promedio:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {" "}
              {AveragePrice !== null ? `${AveragePrice}` : "¡No disponible!"}
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
          <View style={styles.row}>
            <MaterialIcons name="trending-up" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Rentabilidad total:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {position.State
                ? TotalProfitability !== null
                  ? `${TotalProfitability}%`
                  : "Cargando..."
                : totalReturnClosedPosition !== null
                ? `${totalReturnClosedPosition}%`
                : "Cargando..."}
            </Text>
          </View>

          <View style={styles.row}>
            <MaterialIcons name="trending-up" size={20} color={colors.text} />
            <Text style={[styles.label, { color: colors.text }]}>
              Asignación activa:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {position.State
                ? activeAssignment !== null
                  ? `${activeAssignment}%`
                  : "Cargando..."
                : "0%"}
            </Text>
          </View>

          {/* Agregar el componente de rentabilidad después de la fecha de operación */}

          <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
  <View
    style={{
      backgroundColor: isBuy ? colors.primary : colors.secondary,
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 6, // 🔹 Reduce el ancho sin afectar la legibilidad
      marginLeft: 6, // 🔹 Ajuste menor del margen
      minWidth: 50, // 🔹 Asegura un ancho mínimo sin ser excesivo
      alignItems: "center",
    }}
  >
    <Text
      style={[
        styles.label,
        {
          color: colors.text_black,
          fontSize: 12, // 🔹 Un tamaño de texto más compacto
          textAlign: "center",
          letterSpacing: 0.2, // 🔹 Reduce la separación de letras
          fontWeight: "600", // 🔹 Se mantiene negrita sin ser excesivo
        },
      ]}
    >
      {isBuy ? "HISTORIAL DE LA COMPRA" : "HISTORIAL DE LA VENTA"}
    </Text>
  </View>
</TouchableOpacity>

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
            style={[styles.closeButton, {marginTop: 10, backgroundColor: colors.primary }]}
            labelStyle={{ color: "#000" }}
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
            onClose={handleUpdateAfterPartialAdd}
          />
          <Button
            mode="contained"
            onPress={() => setPlusModalVisible(false)}
            style={[styles.closeButton, {marginTop: 10, backgroundColor: colors.primary }]}
            labelStyle={{ color: "#000" }}
          >
            Cerrar
          </Button>
        </ScrollView>
      </Modal>

      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent={false}
      >
        <ScrollView
          contentContainerStyle={{
            backgroundColor: colors.surface,
            padding: 20,
          }}
        >
          <SnackPositionReport data={positionData} />
          <Button
           
            mode="contained"
            onPress={() => setHistoryModalVisible(false)}
            style={[styles.closeButton, {marginTop: 10, backgroundColor: colors.primary }]}
            labelStyle={{ color: fonts.text_black }}
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
