import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Text,
  Switch,
  FAB,
  Portal,
  Provider,
  IconButton,
  Button,
  List,
} from "react-native-paper";
import { useTheme } from "@/hooks/useThemeProvider";
import PositionsService from "@/hooks/recipes/PositionService";
import SnackPositionCard from "@/components/snacks/positions/SnackPositionCard";
import SnackPositionTable from "@/components/snacks/positions/SnackPositionTable";
import SnackNewPosition from "@/components/snacks/positions/SnackNewPosition";
import { useAuth } from "@/hooks/recipes/authService"; // Servicio de autenticación
import { MaterialIcons } from "@expo/vector-icons"; // ✅ Importar el icono de MaterialIcons
import { fetchPortfolioProfitability } from "@/recipes/calculators/CalculatePortfolioProfitability";
import LottieException from "@/components/snacks/animations/LottieException";
import SnackTradingHistory from "@/components/snacks/portfolio/SnackTradingHistory";
import { useWindowDimensions } from "react-native";

// Define the Position type
interface Position {
  id: number;
  Symbol: string;
  PriceEntry: string;
  StopLoss: string;
  TakeProfit: string;
  TakeProfit2: string;
  TradeDirection: string;
  PositionType: string;
  ActiveAllocation: string;
  TradeDate: string;
  State: boolean;
}

export default function ManagePositions() {
  const { colors, fonts, fontSizes } = useTheme();
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolioResult, setPortfolioResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [modalVisible, setModalVisible] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const { user } = useAuth(); // Obtiene el usuario autenticado
  const [historyModalVisible, setHistoryModalVisible] = useState(false); // 📌 Estado para mostrar el historial
  const [monthsFilterModalVisible, setMonthsFilterModalVisible] =
    useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [filteredClosedPositions, setFilteredClosedPositions] = useState<
    Position[]
  >([]);

  const loadPositions = async () => {
    try {
      console.log(`Loading ${showClosed ? "closed" : "open"} positions...`);

      let data;

      if (showClosed) {
        // Si está habilitada la opción de posiciones cerradas, aplicamos el filtro
        data = await PositionsService.getClosedPositionsWithFilter(
          selectedMonths
        );
      } else {
        // Si no, cargamos las posiciones abiertas
        data = await PositionsService.getAllPositions();
      }

      setPositions(data.results);
      console.log("Positions loaded:", data.results);

      // 📌 Llamamos la función para calcular el portafolio
      const portfolioData = await fetchPortfolioProfitability(data);

      console.log(
        "✅ Respuesta recibida del cálculo de portafolio:",
        portfolioData
      );

      setPortfolioResult(portfolioData); // ✅ Guardar como objeto en el estado
    } catch (error) {
      console.error("❌ Error loading positions:", error);
    } finally {
      setLoading(false);
    }
  };

  const { width } = useWindowDimensions(); // 📌 Obtiene el ancho de la pantalla
const numColumns = width < 600 ? 1 : width < 900 ? 2 : 3; // 📌 Móvil: 1 columna, Tablet: 2, Pantallas grandes: 3


  const fetchClosedPositionsWithFilter = async () => {
    try {
      setLoading(true);
      console.log(
        `Fetching closed positions with ${selectedMonths} months filter...`
      );

      const data = await PositionsService.getClosedPositionsWithFilter(
        selectedMonths
      );
      setFilteredClosedPositions(data.results);
    } catch (error) {
      console.error("❌ Error fetching filtered closed positions:", error);
    } finally {
      setMonthsFilterModalVisible(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showClosed) {
      console.log(
        `🔄 Cargando posiciones cerradas con filtro de ${selectedMonths} meses...`
      );
      fetchClosedPositionsWithFilter();
    }
  }, [showClosed]); // Se ejecuta cuando showClosed cambia a true

  useEffect(() => {
    setLoading(true); // Mostrar loader mientras se cargan los datos
    loadPositions();
  }, [showClosed]); // Se ejecutará cuando `showClosed` cambie

  const handleNewPosition = async (newPosition: Position) => {
    setPositions((prevPositions) => [newPosition, ...prevPositions]);
    setModalVisible(false);

    // Recargar las posiciones y el rendimiento del portafolio
    await loadPositions();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Cargando posiciones...
        </Text>
      </View>
    );
  }

  return (
    <Provider>
      <View
        style={[styles.container, { backgroundColor: colors.background_white }]}
      >
        <View style={styles.header}>
          <View style={styles.switchContainer}>
            <View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>Estado:</Text>
              <Switch
                value={!showClosed}
                onValueChange={() => setShowClosed((prev) => !prev)}
                color={colors.primary}
              />
              {showClosed ? (
                <TouchableOpacity
                  onPress={() => setMonthsFilterModalVisible(true)}
                >
                  <Text style={[styles.switchText, styles.linkText]}>
                    {selectedMonths} {selectedMonths === 1 ? "mes" : "meses"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.switchText}>Abiertas</Text>
              )}
            </View>

            {/*<View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>Vista:</Text>
              <Switch
                value={viewMode === "table"}
                onValueChange={() =>
                  setViewMode((prev) => (prev === "card" ? "table" : "card"))
                }
                color={colors.primary}
                style={styles.smallSwitch}
              />
              <Text style={styles.switchText}>
                {viewMode === "card" ? "Tarjetas" : "Tabla"}
              </Text>
            </View>*/}
          </View>

          <TouchableOpacity
            onPress={() => {
              console.log("📊 Abriendo historial del portafolio...");
              console.log(
                "➡ Datos actuales de portfolioResult:",
                portfolioResult
              );
              setHistoryModalVisible(false);
            }}
          >
            <View style={[styles.portfolioResultContainer]}>
              <Text style={styles.portfolioResultTitle}>📊 Portafolio</Text>
              <View style={styles.portfolioCard}>
                <Text style={styles.portfolioResultValue}>
                  {showClosed
                    ? portfolioResult?.estadoGeneral?.rentabilidadTotalCerrada
                      ? `RTC: ${portfolioResult.estadoGeneral.rentabilidadTotalCerrada}%`
                      : "Sin datos"
                    : portfolioResult?.estadoGeneral?.rentabilidadTotalActiva
                    ? `RTA: ${portfolioResult.estadoGeneral.rentabilidadTotalActiva}%`
                    : "Sin datos"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 📌 Mostrar Lottie si no hay posiciones */}
        {positions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieException size={250} />
            <Text style={styles.emptyText}>
              {showClosed
                ? "No hay posiciones cerradas disponibles"
                : "No hay posiciones abiertas disponibles"}
            </Text>
            <Button
              mode="contained"
              onPress={loadPositions}
              style={[
                styles.reloadButton,
                {
                  backgroundColor: colors.primary,
                  alignSelf: "center", // Centra el botón
                  paddingHorizontal: 25, // Aumenta el espaciado lateral
                  paddingVertical: 10, // Ajusta la altura del botón
                  minWidth: 120, // Evita que el botón sea demasiado pequeño
                },
              ]}
              labelStyle={[styles.reloadButtonText, { textAlign: "center" }]}
            >
              Actualizar
            </Button>
          </View>
        ) : viewMode === "card" ? (
          <FlatList
  key={`flatlist-${numColumns}`} // 🔹 Fuerza un re-render cuando numColumns cambia
  data={showClosed ? filteredClosedPositions : positions}
  renderItem={({ item }) => (
    <SnackPositionCard
      position={item}
      viewMode={viewMode}
      onUpdate={loadPositions}
    />
  )}
  keyExtractor={(item) => item.id.toString()}
  numColumns={numColumns} // ✅ Se mantiene dinámico
  columnWrapperStyle={numColumns > 1 ? { justifyContent: "space-between", paddingHorizontal: 8 } : undefined}
  contentContainerStyle={{ paddingHorizontal: 8 }}
/>
        ) : (
          <SnackPositionTable
            positions={positions}
            viewMode={viewMode}
            onUpdate={loadPositions}
          />
        )}

        {user && (
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Modal para nueva posición */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <SnackNewPosition
            onClose={() => setModalVisible(false)}
            onSave={handleNewPosition}
          />
        </Modal>

        {/* 📌 Modal de Historial */}
        <Modal
          visible={historyModalVisible}
          animationType="slide"
          onRequestClose={() => setHistoryModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.background,
            }}
          >
            {portfolioResult && (
              <SnackTradingHistory
                portfolioResult={portfolioResult}
                showClosed={showClosed}
              />
            )}
            <Button
              mode="contained"
              onPress={() => setHistoryModalVisible(false)}
              style={[{ marginTop: 10, backgroundColor: colors.primary }]}
              labelStyle={{ color: "#000" }}
            >
              Cerrar
            </Button>
          </View>
        </Modal>

        <Modal
          visible={monthsFilterModalVisible}
          animationType="slide"
          transparent={true} // 🔹 Hace que el fondo sea más estético
          onRequestClose={() => setMonthsFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Seleccionar Antigüedad</Text>

              {/* 🔹 ScrollView permite desplazarse en caso de contenido extenso */}
              <ScrollView style={styles.scrollContainer}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <TouchableOpacity
                    key={month}
                    onPress={() => setSelectedMonths(month)}
                    style={[
                      styles.monthItem,
                      selectedMonths === month && styles.selectedMonthItem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthItemText,
                        selectedMonths === month && styles.selectedMonthText,
                      ]}
                    >
                      {month} {month === 1 ? "mes" : "meses"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Botón para aplicar el filtro */}
              <Button
                mode="contained"
                onPress={fetchClosedPositionsWithFilter}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
  },
  fab: {
    borderRadius: 50,
  },

  switchContainer: {
    flexDirection: "column", // Organiza los switches en vertical
    alignItems: "center", // Centra los elementos
    marginBottom: 10, // Espacio debajo de los switches
  },
  switchGroup: {
    flexDirection: "row", // Cada grupo (estado/vista) sigue en horizontal
    alignItems: "center",
    marginBottom: 5, // Espaciado entre grupos
  },
  switchLabel: {
    fontSize: 14, // Texto más pequeño
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginRight: 5, // Espaciado entre el texto y el switch
  },
  switchText: {
    fontSize: 12, // Texto más pequeño para el estado
    fontFamily: "Montserrat-Regular",
    color: "#666",
    marginLeft: 5, // Espaciado entre el switch y el texto
  },
  smallSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], // Hace el switch más pequeño
  },
  smallButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 50,
    backgroundColor: "transparent", // Sin fondo
    padding: 5, // Espaciado alrededor del icono
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  portfolioResultContainer: {
    marginTop: 5, // Reducido aún más
    paddingVertical: 5, // Menos padding
    paddingHorizontal: 10, // Más compacto en los lados
    backgroundColor: "#0C0C0C",
    borderRadius: 8, // Bordes más pequeños
    alignItems: "center",
    shadowColor: "#F29F05",
    shadowOffset: { width: 0, height: 1 }, // Menos sombra
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2, // Menos sombra en Android
  },
  portfolioResultTitle: {
    fontSize: 14, // Más pequeño
    fontFamily: "Raleway-Bold",
    color: "#F2B705",
    textTransform: "uppercase",
    letterSpacing: 0.8, // Espaciado mínimo
    marginBottom: 3, // Menos espacio
  },
  portfolioCard: {
    padding: 8, // Más compacto
    borderRadius: 6, // Bordes más pequeños
    backgroundColor: "#F29F05",
    minWidth: "60%", // Reduce el ancho
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, // Menos sombra
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  portfolioResultValue: {
    fontSize: 16, // Más compacto
    fontFamily: "Montserrat-Bold",
    color: "#0C0C0C",
    textAlign: "center",
    paddingVertical: 2, // Menos padding
  },
  reloadButton: {
    alignSelf: "center", // Centra el botón
    paddingHorizontal: 25, // Espaciado lateral sin afectar el ancho
    paddingVertical: 10, // Ajuste de altura
    minWidth: 120, // Ancho mínimo para evitar botones muy pequeños
    maxWidth: 250, // Evita que el botón sea demasiado grande
    width: 300,
  },

  reloadButtonText: {
    color: "#0C0C0C", // 📌 Mismo color del texto del portafolio
    fontFamily: "Montserrat-Bold",
    fontSize: 22,
  },
  emptyText: {
    textAlign: "center", // 📌 Centra el texto horizontalmente
    fontSize: 22, // 📌 Aumenta el tamaño del texto para mejor visibilidad
    fontWeight: "bold", // 📌 Hace el texto en negrita
    marginVertical: 15, // 📌 Espaciado superior e inferior
    color: "#333", // 📌 Un color oscuro para mejor contraste
    fontFamily: "Montserrat-Bold", // 📌 Usa una fuente más estilizada
  },
  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  modalContent: {
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)", // 🔹 Fondo semitransparente
  },
  modalContainer: {
    backgroundColor: "#0C0C0C", // 🔹 Fondo oscuro
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "80%",
    minHeight: "50%",
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#F2B705",
    textAlign: "center",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  scrollContainer: {
    width: "100%",
    maxHeight: 300, // 🔹 Scroll activo si hay más opciones
  },
  monthItem: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  monthItemText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#FFFFFF",
  },
  selectedMonthItem: {
    backgroundColor: "#F29F05",
  },
  selectedMonthText: {
    fontFamily: "Montserrat-Bold",
    color: "#0C0C0C",
  },
  applyButton: {
    marginTop: 15,
    backgroundColor: "#F29F05",
    borderRadius: 8,
    width: "85%",
    paddingVertical: 12,
  },
  applyButtonText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: "#0C0C0C",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#444",
    borderRadius: 8,
    width: "85%",
    paddingVertical: 10,
  },
  closeButtonText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
  },
  flatListContainer: {
    flex: 1,
    paddingBottom: 20, // Espaciado inferior
  },
  columnWrapper: {
    justifyContent: "space-between", // Distribuye bien las tarjetas en varias columnas
    paddingHorizontal: 10, // Espaciado lateral en pantallas grandes
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    margin: 10, // Espaciado entre tarjetas
    elevation: 3,
  },
});
