import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  Text,
  Switch,
  FAB,
  Portal,
  Provider,
  IconButton,
} from "react-native-paper";
import { useTheme } from "@/hooks/useThemeProvider";
import PositionsService from "@/hooks/recipes/PositionService";
import SnackPositionCard from "@/components/snacks/positions/SnackPositionCard";
import SnackPositionTable from "@/components/snacks/positions/SnackPositionTable";
import SnackNewPosition from "@/components/snacks/positions/SnackNewPosition";

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
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [modalVisible, setModalVisible] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  const loadPositions = async () => {
    try {
      console.log(`Loading ${showClosed ? "closed" : "open"} positions...`);
      const data = showClosed
        ? await PositionsService.getAllClosedPositions()
        : await PositionsService.getAllPositions();

      setPositions(data.results);
      console.log("Positions loaded:", data.results);
    } catch (error) {
      console.error("Error loading positions:", error);
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
          <Text
            style={[
              styles.title,
              {
                fontFamily: fonts.Montserrat.bold,
                fontSize: fontSizes.extraLarge,
              },
            ]}
          >
            Gestor de Posiciones
          </Text>
          <View style={styles.switchContainer}>
  <View style={styles.switchGroup}>
    <Text style={styles.switchLabel}>Estado:</Text>
    <Switch
  value={!showClosed} // Invertimos la lógica
  onValueChange={() => setShowClosed((prev) => !prev)}
  color={colors.primary}
  style={styles.smallSwitch}
/>
<Text style={styles.switchText}>{!showClosed ? "Abiertas" : "Cerradas"}</Text>
  </View>

  <View style={styles.switchGroup}>
    <Text style={styles.switchLabel}>Vista:</Text>
    <Switch
      value={viewMode === "table"}
      onValueChange={() => setViewMode((prev) => (prev === "card" ? "table" : "card"))}
      color={colors.primary}
      style={styles.smallSwitch}
    />
    <Text style={styles.switchText}>{viewMode === "card" ? "Tarjetas" : "Tabla"}</Text>
  </View>
</View>

        </View>

        {viewMode === "card" ? (
  <FlatList
    data={positions}
    renderItem={({ item }) => (
      <SnackPositionCard position={item} viewMode={viewMode} />
    )}
    keyExtractor={(item) => item.id.toString()}
    contentContainerStyle={styles.list}
  />
) : (
  <SnackPositionTable positions={positions} viewMode={viewMode} />
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
});
