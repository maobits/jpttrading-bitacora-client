import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Text, Button, DataTable, IconButton } from "react-native-paper";
import { useTheme } from "@/hooks/useThemeProvider";
import SnackHistoricalSymbol from "./SnackHistoricalSymbol";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import SnackPartialAdd from "./SnackPartialAdd";
import SnackProfitabilityPosition from "./SnackProfitabilityPosition";
import YFinanceService from "@/hooks/recipes/YFinanceService";
import { useAuth } from "@/hooks/recipes/authService"; // ✅ Importar la autenticación
import { fetchPositionProfitability } from "@/recipes/calculators/PositionProfitabilityCalculator";
import SnackPositionReport from "./SnackPositionReport";

const { width: screenWidth } = Dimensions.get("window");

// Helper para formatear valores en dólares americanos
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

interface SnackPositionTableProps {
  positions: {
    Symbol: string;
    PriceEntry: string;
    StopLoss: string;
    TakeProfit: string;
    TakeProfit2: string;
    TradeDirection: string;
    ActiveAllocation: string;
    TradeDate: string;
    State: boolean;
  }[];
  viewMode?: "card" | "table"; // Agregamos la propiedad opcional
  onUpdate: () => void; // 🔹 Aseguramos que se espera esta prop
}

const SnackPositionTable: React.FC<SnackPositionTableProps> = ({
  positions,
  viewMode,
  onUpdate, // 🔹 Recibimos la función aquí
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [plusModalVisible, setPlusModalVisible] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [currentPrice, setCurrentPrice] = useState("Cargando...");
  const [currentPrices, setCurrentPrices] = useState<{
    [symbol: string]: number;
  }>({});
  const { user } = useAuth(); // ✅ Verifica si hay usuario autenticado
  const [profitabilityData, setProfitabilityData] = useState<{
    [symbol: string]: { rentabilidadTotal: string; asignacionActiva: string };
  }>({});

  const handleUpdateAfterPartialAdd = async () => {
    console.log("📌 Recargando la página...");
    setPlusModalVisible(false);
    window.location.reload();
  };

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [positionData, setPositionData] = useState(null);

  const openReportModal = (position) => {
    setSelectedPosition(position);
    setHistoryModalVisible(true);
  };

  // Obtener datos de rentabilidad para cada posición
  useEffect(() => {
    const fetchProfitability = async () => {
      const results: any = {};

      for (const position of positions) {
        const result = await fetchPositionProfitability(position);

        const rentabilidadTotal = position.State
          ? result?.estadoActual?.rentabilidadTotalActiva ?? "No disponible"
          : result?.historial?.find((item: any) => item.tipo === "cierre_total")
              ?.rentabilidadTotal ?? "No disponible";

        setPositionData(result);

        const asignacionActiva = position.State
          ? result?.estadoActual?.porcentajeAsignacionActiva ?? "No disponible"
          : "0%";

        // Obtener el precio promedio
        const precioPromedio = position.State
          ? result?.estadoActual?.precioPromedio ?? "No disponible"
          : result?.historial?.find((item: any) => item.tipo === "cierre_total")
              ?.precioPromedio ?? "No disponible";

        results[position.Symbol] = { rentabilidadTotal, asignacionActiva, precioPromedio };
      }

      setProfitabilityData(results);
    };

    fetchProfitability();
  }, [positions]);


  const fetchCurrentPrice = async (symbol: string) => {
    try {
      const data = await YFinanceService.getQuote(symbol);
      const price = typeof data === "string" ? NaN : data.price;

      setCurrentPrices((prevPrices) => ({
        ...prevPrices,
        [symbol]: isNaN(price) ? 0 : price, // Si el precio es NaN, establecerlo en 0
      }));

      console.log(`Precio de ${symbol}:`, price);
    } catch (error) {
      console.error(`Error al obtener el precio para ${symbol}:`, error);
      setCurrentPrices((prevPrices) => ({
        ...prevPrices,
        [symbol]: 0, // Valor por defecto si hay un error
      }));
    }
  };

  const parseDatabaseValues = (
    priceEntry: string,
    activeAllocation: string
  ) => {
    try {
      // Parsear los datos
      const priceData = JSON.parse(priceEntry).filter(
        (item: any) => item.type !== "decrease"
      );
      const allocationData = JSON.parse(activeAllocation).filter(
        (item: any) => item.type !== "decrease"
      );

      // Buscar el precio de entrada
      const priceEntryObject = priceData.find((item: any) => item.id === 1);
      const entryPrice = priceEntryObject
        ? formatCurrency(parseFloat(priceEntryObject.price))
        : "No disponible";

      // Calcular el acumulado total actual
      const totalAllocation = allocationData.reduce(
        (acc: number, alloc: any, index: number) => {
          const increment = parseFloat(alloc.activeAllocation) / 100;
          return index === 0 ? increment : acc * (1 + increment);
        },
        1
      );

      const activeAllocationPercent = (totalAllocation * 100).toFixed(2) + "%";

      // Calcular el acumulado previo
      const previousAccumulated = allocationData
        .slice(0, -1)
        .reduce((acc: number, alloc: any, index: number) => {
          const increment = parseFloat(alloc.activeAllocation) / 100;
          return index === 0 ? increment : acc * (1 + increment);
        }, 1);

      // Calcular el precio promedio previo
      const previousPrice =
        priceData
          .slice(0, -1)
          .reduce((acc: number, item: any, index: number) => {
            const allocation = parseFloat(
              allocationData[index].activeAllocation
            );
            return acc + parseFloat(item.price) * (allocation / 100);
          }, 0) / previousAccumulated;

      // Precio de entrada actual
      const currentEntryPrice = parseFloat(
        priceData[priceData.length - 1].price
      );

      // Calcular el precio promedio dinámico usando la fórmula
      const calculatedAveragePrice =
        (previousPrice * previousAccumulated +
          currentEntryPrice * (totalAllocation - previousAccumulated)) /
        totalAllocation;

      // Retornar los valores
      return {
        entryPrice,
        activeAllocationPercent,
        averagePrice: formatCurrency(calculatedAveragePrice),
      };
    } catch (error) {
      console.error("Error al parsear datos:", error);
      return {
        entryPrice: "No disponible",
        activeAllocationPercent: "No disponible",
        averagePrice: "No disponible",
      };
    }
  };

  const openModal = (symbol: string, position: any) => {
    setSelectedSymbol(symbol);
    setSelectedPosition(position);
    setModalVisible(true);
  };

  const openPlusModal = (position: any) => {
    setSelectedPosition(position);
    setPlusModalVisible(true);
  };

  const closeModal = () => {
    setSelectedSymbol(null);
    setSelectedPosition(null);
    setModalVisible(false);
  };

  const closePlusModal = () => {
    setSelectedPosition(null);
    setPlusModalVisible(false);
  };

  useEffect(() => {
    positions.forEach((position) => {
      fetchCurrentPrice(position.Symbol);
    });
  }, [positions]); // Se ejecuta cuando `positions` cambia

  return (
    <>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <ScrollView
  horizontal
  style={{ flex: 1 }} // ✅ Permite que el ScrollView ocupe todo el alto disponible
  contentContainerStyle={{
    width: "100%",
    paddingHorizontal: 10,
    flexGrow: 1, // ✅ Evita que el contenido se colapse y permite el uso de flex
  }}
>
        <View
          style={{
            minWidth: screenWidth < 600 ? screenWidth * 1.2 : "100%",
          }}
        >
          <DataTable
            style={[
              styles.table,
              {
                borderColor: colors.primary,
                backgroundColor: colors.surface,
              },
            ]}
          >
            {/* Header */}
            <DataTable.Header
              style={[
                styles.tableHeader,
                {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
            >
              {[
                "Símbolo",
                "Entrada",
                "Promedio",
                "P. Actual",
                "Stop Loss",
                "Take Profit 1",
                "Take Profit 2",
                "Dirección",
                "Estado",
                "Fecha",
                "Rentabilidad",
                "Acciones",
              ].map((header, index) => (
                <DataTable.Title
                  key={header}
                  style={[
                    styles.headerCell,
                    index === 10
                      ? { borderRightWidth: 0 }
                      : { borderRightWidth: 1 },
                  ]}
                >
                  <Text style={[styles.headerText, { color: colors.primary }]}>
                    {header}
                  </Text>
                </DataTable.Title>
              ))}
            </DataTable.Header>

            {/* Rows */}
            {positions.map((position, index) => {
              const isBuy = position.TradeDirection === "Buy";
              const statusColor = position.State ? "green" : colors.secondary;
              const { entryPrice, activeAllocationPercent, averagePrice } =
                parseDatabaseValues(
                  position.PriceEntry,
                  position.ActiveAllocation
                );

              return (
                <DataTable.Row
                  key={position.Symbol}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 && {
                      backgroundColor: colors.background_white,
                    },
                  ]}
                >
                  <DataTable.Cell style={styles.cell}>
                    <Text style={[styles.cellText, { color: colors.text }]}>
                      {position.Symbol}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={[styles.numberText, { color: colors.text }]}>
                      {entryPrice}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
  <Text style={[styles.numberText, { color: colors.text }]}>
    {profitabilityData[position.Symbol]?.precioPromedio
      ? formatCurrency(parseFloat(profitabilityData[position.Symbol]?.precioPromedio))
      : "No disponible"}
  </Text>
</DataTable.Cell>

                  <DataTable.Cell style={styles.cell}>
                    <Text style={[styles.numberText, { color: colors.text }]}>
                      {formatCurrency(currentPrices[position.Symbol] || 0)}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={[styles.numberText, { color: colors.text }]}>
                      {formatCurrency(parseFloat(position.StopLoss))}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={[styles.numberText, { color: colors.text }]}>
                      {formatCurrency(parseFloat(position.TakeProfit))}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={[styles.numberText, { color: colors.text }]}>
                      {formatCurrency(parseFloat(position.TakeProfit2))}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <TouchableOpacity onPress={() => openReportModal(position)}>
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: isBuy
                            ? colors.primary
                            : colors.secondary,
                          borderRadius: 4,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          alignItems: "center",
                        }}
                      >
                        <MaterialIcons
                          name="event-note"
                          size={16}
                          color={colors.text_black}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.cellText,
                            { color: colors.text_black },
                          ]}
                        >
                          {isBuy ? "Compra" : "Venta"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </DataTable.Cell>

                  <DataTable.Cell style={styles.cell}>
                    <Text style={{ color: statusColor }}>
                      {position.State ? "Abierta" : "Cerrada"}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={[styles.cellText, { color: colors.text }]}>
                      {position.TradeDate}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={[styles.numberText, { color: colors.text }]}>
                      {`RT/ ${
                        profitabilityData[position.Symbol]
                          ?.rentabilidadTotal !== "No disponible"
                          ? `${
                              profitabilityData[position.Symbol]
                                ?.rentabilidadTotal
                            }%`
                          : "No disponible"
                      }  AA ${
                        profitabilityData[position.Symbol]?.asignacionActiva !==
                        "No disponible"
                          ? `${
                              profitabilityData[position.Symbol]
                                ?.asignacionActiva
                            }`
                          : "No disponible"
                      }`}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Button
                        mode="text"
                        onPress={() => openModal(position.Symbol, position)}
                        labelStyle={[
                          styles.actionButton,
                          { color: colors.primary },
                        ]}
                      >
                       {position.Symbol}
                      </Button>
                      {user && (
                        <IconButton
                          icon="plus"
                          size={20}
                          color={colors.primary}
                          onPress={() => openPlusModal(position)}
                        />
                      )}
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </DataTable>
        </View>
      </ScrollView>
      </ScrollView>

      {/* Modal Historial */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <ScrollView
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.primary }]}>
            Historial de {selectedSymbol}
          </Text>
          {selectedPosition && (
            <SnackHistoricalSymbol
              symbol={selectedSymbol}
              period="1mo"
              priceHistory={JSON.parse(selectedPosition.PriceEntry)}
              activeAllocationHistory={JSON.parse(
                selectedPosition.ActiveAllocation
              )}
            />
          )}
          <Button
            mode="contained"
            onPress={closeModal}
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.text_black }}
          >
            Cerrar
          </Button>
        </ScrollView>
      </Modal>

      {/* Modal Nueva Posición */}
      <Modal
        visible={plusModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closePlusModal}
      >
        <ScrollView
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          {selectedPosition && (
            <SnackPartialAdd
              positionId={selectedPosition.id}
              onClose={handleUpdateAfterPartialAdd} // ✅ Ahora usa la función corregida
            />
          )}
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
            style={{ marginTop: 10 }}
          >
            Cerrar
          </Button>
        </ScrollView>
      </Modal>

    </>
  );
};

const styles = StyleSheet.create({
  table: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  tableHeader: {
    borderBottomWidth: 2,
    flexDirection: "row",
  },
  headerText: {
    fontFamily: "Raleway-Bold",
    fontSize: 16,
    textAlign: "center",
  },
  headerCell: {
    flex: 1,
    justifyContent: "center",
    borderRightColor: "#ddd",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    padding: 20,
    width: "100%",
  },
  cellText: {
    fontFamily: "Raleway-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  numberText: {
    fontFamily: "Raleway-Bold",
    fontSize: 16,
    textAlign: "center",
  },
  actionButton: {
    fontFamily: "Raleway-Bold",
    fontSize: 12,
  },
  modalContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Raleway-Bold",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    width: "90%",
    alignSelf: "center",
  },
});

export default SnackPositionTable;
