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

  const loadPositions = async () => {
    try {
      console.log("Loading positions...");
      const data = await PositionsService.getAllPositions();
      setPositions(data.results);
      console.log("Positions loaded:", data.results);
    } catch (error) {
      console.error("Error loading positions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

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
            <Text
              style={[
                styles.switchLabel,
                { fontFamily: fonts.Montserrat.bold, color: colors.text_black },
              ]}
            >
              {viewMode === "card" ? "Vista tarjetas" : "Vista tabla"}
            </Text>
            <Switch
              value={viewMode === "table"}
              onValueChange={() =>
                setViewMode((prev) => (prev === "card" ? "table" : "card"))
              }
              color={colors.primary}
            />
            <IconButton
              icon="plus"
              size={28}
              onPress={() => setModalVisible(true)}
              style={[
                styles.fab,
                { backgroundColor: colors.primary, marginLeft: 10 },
              ]}
              iconColor={colors.text_black}
            />
          </View>
        </View>

        {viewMode === "card" ? (
          <FlatList
            data={positions}
            renderItem={({ item }) => <SnackPositionCard position={item} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
          />
        ) : (
          <SnackPositionTable positions={positions} />
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 16,
    fontFamily: "Raleway-Regular",
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
});
