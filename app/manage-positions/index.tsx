import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Switch,
  FAB,
  Portal,
  Provider,
  IconButton,
  Button,
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

  const loadPositions = async () => {
    try {
      console.log(`Loading ${showClosed ? "closed" : "open"} positions...`);
      const data = showClosed
        ? await PositionsService.getAllClosedPositions()
        : await PositionsService.getAllPositions();

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
                style={styles.smallSwitch}
              />
              <Text style={styles.switchText}>
                {!showClosed ? "Abiertas" : "Cerradas"}
              </Text>
            </View>

            <View style={styles.switchGroup}>
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
            </View>
          </View>

          <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
            <View style={[styles.portfolioResultContainer]}>
              <Text style={styles.portfolioResultTitle}>📊 Portafolio</Text>
              <View style={styles.portfolioCard}>
                <Text style={styles.portfolioResultValue}>
                  {showClosed
                    ? portfolioResult?.historial?.length > 0
                      ? `RTC: ${portfolioResult.estadoActual.rentabilidadTotalCerrada}%`
                      : "Sin datos"
                    : portfolioResult?.estadoActual?.rentabilidadTotalActiva
                    ? `RTA: ${portfolioResult.estadoActual.rentabilidadTotalActiva}%`
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
              style={styles.reloadButton}
              labelStyle={styles.reloadButtonText}
            >
              Actualizar
            </Button>
          </View>
        ) : viewMode === "card" ? (
          <FlatList
            data={positions}
            renderItem={({ item }) => (
              <SnackPositionCard
                position={item}
                viewMode={viewMode}
                onUpdate={loadPositions}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
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
       <Modal visible={historyModalVisible} animationType="slide" onRequestClose={() => setHistoryModalVisible(false)}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
            {portfolioResult && (
              <SnackTradingHistory portfolioResult={portfolioResult} showClosed={showClosed} />
            )}
            <Button mode="contained" onPress={() => setHistoryModalVisible(false)}>
              Cerrar
            </Button>
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
    backgroundColor: "#F29F05", // 📌 Color del portafolio
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    elevation: 3, // Sombra para resaltar el botón
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
});
