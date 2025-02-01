import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Divider,
} from "react-native-paper";
import YFinanceService from "@/hooks/recipes/YFinanceService";
import PositionsService from "@/hooks/recipes/PositionService";
import { useTheme } from "@/hooks/useThemeProvider";
import { SegmentedButtons } from "react-native-paper";

interface SnackNewPositionProps {
  onClose: () => void;
  onSave: (position: any) => void;
}

export default function SnackNewPosition({
  onClose,
  onSave,
}: SnackNewPositionProps) {
  const { colors, fonts } = useTheme();

  const [formData, setFormData] = useState({
    symbol: "",
    priceEntry: "",
    stopLoss: "",
    takeProfit: "",
    takeProfit2: "",
    tradeDirection: "Buy",
    positionType: "Entry",
    activeAllocation: "",
    tradeDate: new Date().toISOString().split("T")[0],
    priceEntries: [] as { id: number; price: string; date: string }[],
    activeAllocations: [] as {
      id: number;
      activeAllocation: string;
      date: string;
    }[],
  });

  const [errors, setErrors] = useState({
    symbol: "",
    priceEntry: "",
    stopLoss: "",
    takeProfit: "",
    takeProfit2: "",
    activeAllocation: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validateFields = async (): Promise<boolean> => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.symbol) {
      newErrors.symbol = "Por favor, ingrese un símbolo válido.";
      isValid = false;
    } else {
      const quote = await YFinanceService.getQuote(formData.symbol);
      if (quote === "No disponible") {
        newErrors.symbol = "El símbolo ingresado no existe.";
        isValid = false;
      }
    }

    ["priceEntry", "stopLoss", "takeProfit", "takeProfit2"].forEach((field) => {
      const value = formData[field as keyof typeof formData];
      if (!value || isNaN(Number(value)) || Number(value) <= 0) {
        newErrors[
          field as keyof typeof errors
        ] = `Debe ingresar un valor válido para ${field}.`;
        isValid = false;
      }
    });

    const allocation = Number(formData.activeAllocation);
    if (
      !allocation ||
      isNaN(allocation) ||
      allocation <= 0 ||
      allocation > 100
    ) {
      newErrors.activeAllocation =
        "Debe ingresar un porcentaje de asignación entre 1 y 100.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    const isValid = await validateFields();
    if (!isValid) return;

    const addPriceEntry = (): string => {
      const newId =
        formData.priceEntries.length > 0
          ? formData.priceEntries[formData.priceEntries.length - 1].id + 1
          : 1;
      const newPriceEntry = {
        id: newId,
        price: formData.priceEntry,
        date: new Date().toISOString(),
      };
      return JSON.stringify([...formData.priceEntries, newPriceEntry]);
    };

    const addActiveAllocation = (): string => {
      const newId =
        formData.activeAllocations.length > 0
          ? formData.activeAllocations[formData.activeAllocations.length - 1]
              .id + 1
          : 1;
      const newAllocation = {
        id: newId,
        activeAllocation: formData.activeAllocation,
        date: new Date().toISOString(),
      };
      return JSON.stringify([...formData.activeAllocations, newAllocation]);
    };

    try {
      const newPosition = {
        Symbol: formData.symbol.toUpperCase(),
        PriceEntry: addPriceEntry(), // Almacenado como cadena JSON
        StopLoss: formData.stopLoss,
        TakeProfit: formData.takeProfit,
        TakeProfit2: formData.takeProfit2,
        TradeDirection: formData.tradeDirection,
        PositionType: formData.positionType,
        ActiveAllocation: addActiveAllocation(), // Almacenado como cadena JSON
        TradeDate: formData.tradeDate,
        State: true,
      };

      const savedPosition = await PositionsService.createPosition(newPosition);
      onSave(savedPosition);
    } catch (error) {
      console.error("Error al guardar la posición:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        symbol: "No se pudo guardar la posición. Intente de nuevo.",
      }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>
            Crear Nueva Posición
          </Text>
        </View>
        <Divider
          style={[styles.divider, { backgroundColor: colors.primary }]}
        />

        <TextInput
          label="Símbolo (ej. MSFT)"
          value={formData.symbol}
          onChangeText={(value) => handleInputChange("symbol", value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.symbol}
        />
        <HelperText type="error" visible={!!errors.symbol}>
          {errors.symbol}
        </HelperText>

        <TextInput
          label="Precio de Entrada"
          value={formData.priceEntry}
          onChangeText={(value) => handleInputChange("priceEntry", value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.priceEntry}
        />
        <HelperText type="error" visible={!!errors.priceEntry}>
          {errors.priceEntry}
        </HelperText>

        <TextInput
          label="Stop Loss"
          value={formData.stopLoss}
          onChangeText={(value) => handleInputChange("stopLoss", value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.stopLoss}
        />
        <HelperText type="error" visible={!!errors.stopLoss}>
          {errors.stopLoss}
        </HelperText>

        <TextInput
          label="Take Profit"
          value={formData.takeProfit}
          onChangeText={(value) => handleInputChange("takeProfit", value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.takeProfit}
        />
        <HelperText type="error" visible={!!errors.takeProfit}>
          {errors.takeProfit}
        </HelperText>

        <TextInput
          label="Take Profit 2"
          value={formData.takeProfit2}
          onChangeText={(value) => handleInputChange("takeProfit2", value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.takeProfit2}
        />
        <HelperText type="error" visible={!!errors.takeProfit2}>
          {errors.takeProfit2}
        </HelperText>

        <TextInput
          label="Asignación Activa (%)"
          value={formData.activeAllocation}
          onChangeText={(value) => handleInputChange("activeAllocation", value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.activeAllocation}
        />
        <HelperText type="error" visible={!!errors.activeAllocation}>
          {errors.activeAllocation}
        </HelperText>

        <Text
          style={{
            marginTop: 10,
            fontSize: 16,
            fontWeight: "bold",
            color: colors.text,
          }}
        >
          Dirección de la Operación
        </Text>
        <View style={{ marginVertical: 10, alignItems: "center", width: "100%" }}>
  <SegmentedButtons
    value={formData.tradeDirection}
    onValueChange={(value) => handleInputChange("tradeDirection", value)}
    buttons={[
      { value: "Buy", label: "Compra", icon: "arrow-up-bold" },
      { value: "Sell", label: "Venta", icon: "arrow-down-bold" },
    ]}
    style={{ width: "80%", minWidth: 200 }} // Ajusta el ancho
  />
</View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            Guardar
          </Button>
          <Button
            mode="outlined"
            onPress={onClose}
            style={[styles.button, { borderColor: colors.secondary }]}
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
