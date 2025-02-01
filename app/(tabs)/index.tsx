import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Text, Switch } from "react-native-paper";
import { useTheme } from "@/hooks/useThemeProvider";
import PositionsService from "@/hooks/recipes/PositionService"; // Ruta actualizada
import SnackPositionCard from "@/components/snacks/positions/SnackPositionCard"; // Ruta actualizada
import SnackPositionTable from "@/components/snacks/positions/SnackPositionTable"; // Ruta actualizada

// Define the Position type
interface Position {
  id: number;
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

export default function HomeScreen() {
  const { colors, fonts, fontSizes } = useTheme();
  const [positions, setPositions] = useState<Position[]>([]); // Use the Position type
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card"); // Manage view mode

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
          Bítacora de JP Tactical Trading
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
    </View>
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
});
