import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Divider,
  Card,
  IconButton,
  RadioButton,
} from "react-native-paper";
import { useTheme } from "@/hooks/useThemeProvider";
import PositionsService from "@/hooks/recipes/PositionService";
import { DatePickerModal } from "react-native-paper-dates";
import SnackUpdatePosition from "./SnackUpdatePosition";

const SnackPartialAdd = ({ positionId, onClose }) => {
  const { colors, fonts } = useTheme();
  const [priceEntry, setPriceEntry] = useState("");
  const [activeAllocation, setActiveAllocation] = useState("");
  const [type, setType] = useState("add");
  const [errors, setErrors] = useState({
    priceEntry: "",
    activeAllocation: "",
  });
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);


  const validateFields = () => {
    let isValid = true;
    const newErrors = {
      priceEntry: "",
      activeAllocation: "",
    };

    if (!priceEntry || isNaN(Number(priceEntry)) || Number(priceEntry) <= 0) {
      newErrors.priceEntry = "Debe ingresar un precio válido.";
      isValid = false;
    }

    if (
      !activeAllocation ||
      isNaN(Number(activeAllocation)) ||
      Number(activeAllocation) <= 0 ||
      Number(activeAllocation) > 100
    ) {
      newErrors.activeAllocation =
        "Debe ingresar un porcentaje de asignación entre 1 y 100.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const getNextIncrementalId = (entries) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return 1;
    }
    const validIds = entries
      .map((entry) => entry.id)
      .filter((id) => typeof id === "number" && isFinite(id));
    return validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    setLoading(true);

    try {
      const position = await PositionsService.getPositionById(positionId);

      const priceEntries = Array.isArray(
        JSON.parse(position.PriceEntry || "[]")
      )
        ? JSON.parse(position.PriceEntry || "[]")
        : [];
      const activeAllocations = Array.isArray(
        JSON.parse(position.ActiveAllocation || "[]")
      )
        ? JSON.parse(position.ActiveAllocation || "[]")
        : [];

      const newId = getNextIncrementalId(priceEntries);

      const updatedPriceEntries = [
        ...priceEntries,
        {
          id: newId,
          price: priceEntry,
          type: type,
          date: selectedDate ? selectedDate.toISOString() : new Date().toISOString().split("T")[0], // 📌 Usa la fecha seleccionada
        },
      ];

      const updatedActiveAllocations = [
        ...activeAllocations,
        {
          id: newId,
          activeAllocation,
          type: type,
          date: selectedDate ? selectedDate.toISOString() : new Date().toISOString().split("T")[0], // 📌 Usa la fecha seleccionada
        },
      ];

      const updatedData = {
        PriceEntry: JSON.stringify(updatedPriceEntries),
        ActiveAllocation: JSON.stringify(updatedActiveAllocations),
      };

      if (type === "close") {
        updatedData.State = false;
        updatedData.SavedPrice = priceEntry;
        updatedData.ClosingDate = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]; // 📌 Usa formato YYYY-MM-DD
            }

      // ✅ Esperar la actualización de la posición
      await PositionsService.updatePosition(positionId, updatedData);

      console.log("✅ Posición actualizada con éxito:", updatedData);

      alert("Datos actualizados con éxito.");

      // 🔄 Esperar antes de cerrar para asegurarse de que todo está sincronizado
      setTimeout(() => {
        onClose();
      }, 500); // Espera 500ms para asegurarse de que la UI se actualiza antes de cerrar
    } catch (error) {
      console.error("❌ Error al actualizar la posición:", error);
      alert("No se pudo actualizar la posición. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <>

    {/* ✅ Modal para Editar la Posición */}
    <SnackUpdatePosition
        visible={editModalVisible}
        positionId={positionId}
        onClose={() => setEditModalVisible(false)}
      />
    
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: "#FFFFFF" }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title
  title="Añadir Datos Parciales"
  titleStyle={[styles.title, { color: colors.primary, fontFamily: fonts.Raleway.bold }]}
  right={() => (
    <View style={{ flexDirection: "row" }}>
      <IconButton icon="pencil" color={colors.primary} size={24} onPress={() => setEditModalVisible(true)} />
      <IconButton icon="close" color={colors.primary} size={24} onPress={onClose} />
    </View>
  )}
/>

        </Card>

        <View style={{ marginBottom: 20 }}>
  <Text style={{ fontSize: 16, fontWeight: "bold" }}>Fecha de la operación</Text>
  <Button mode="outlined" onPress={() => setDatePickerVisible(true)}>
    {selectedDate ? selectedDate.toISOString().split("T")[0] : "Seleccionar Fecha"}
  </Button>

  {/* Modal de selección de fecha */}
  <DatePickerModal
    locale="es"
    mode="single"
    visible={datePickerVisible}
    onDismiss={() => setDatePickerVisible(false)}
    date={selectedDate}
    onConfirm={(params) => {
      setSelectedDate(params.date);
      setDatePickerVisible(false);
    }}
  />
</View>


        <Divider
          style={[styles.divider, { backgroundColor: colors.primary }]}
        />

        <RadioButton.Group
          onValueChange={(value) => {
            setType(value);
            if (value === "close") {
              setActiveAllocation("100"); // 🔹 Fija asignación en 100 si es cierre
            }
          }}
          value={type}
        >
          <View style={styles.radioButtonContainer}>
            <RadioButton value="add" color={colors.primary} />
            <Text style={{ color: colors.black }}>Adición parcial</Text>
          </View>

          <View style={styles.radioButtonContainer}>
            <RadioButton value="decrease" color={colors.primary} />
            <Text style={{ color: colors.black }}>Toma parcial</Text>
          </View>

          <View style={styles.radioButtonContainer}>
            <RadioButton value="close" color={colors.primary} />{" "}
            {/* 🔹 Cambio aquí */}
            <Text style={{ color: colors.black }}>Cerrar posición</Text>
          </View>
        </RadioButton.Group>

        <TextInput
          label="Precio de Entrada"
          value={priceEntry}
          onChangeText={(text) => {
            setPriceEntry(text);
            setErrors((prev) => ({ ...prev, priceEntry: "" }));
          }}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.priceEntry}
          theme={{
            colors: {
              primary: colors.primary,
              text: colors.text,
              placeholder: colors.text_black,
            },
          }}
        />
        <HelperText type="error" visible={!!errors.priceEntry}>
          {errors.priceEntry}
        </HelperText>

        <TextInput
          label="Asignación Activa (%)"
          value={type === "close" ? "100" : activeAllocation} // 🔹 Fijar en 100 si es cierre
          onChangeText={(text) => {
            if (type !== "close") {
              setActiveAllocation(text);
            }
          }}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.activeAllocation}
          disabled={type === "close"} // 🔹 Deshabilitar si es cierre
        />
        <HelperText type="error" visible={!!errors.activeAllocation}>
          {errors.activeAllocation}
        </HelperText>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.primary }]}
            labelStyle={{ color: "#FFFFFF" }}
          >
            Guardar
          </Button>
          <Button
            mode="outlined"
            onPress={onClose}
            style={[styles.button, { borderColor: colors.primary }]}
            labelStyle={{ color: colors.primary }}
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
  },
  divider: {
    height: 2,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    borderRadius: 10,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
  },
});

export default SnackPartialAdd;
