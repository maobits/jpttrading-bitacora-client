import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  IconButton,
} from "react-native-paper";
import { useTheme } from "@/hooks/useThemeProvider";
import PositionsService from "@/hooks/recipes/PositionService";

const SnackUpdatePosition = ({ visible, positionId, onClose }) => {
  const { colors, fonts, fontSizes } = useTheme();
  const [formData, setFormData] = useState({
    Symbol: "",
    StopLoss: "",
    TakeProfit: "",
    TradeDirection: "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  useEffect(() => {
    if (visible && positionId) {
      loadPositionData();
    }
  }, [visible]);

  const loadPositionData = async () => {
    try {
      const position = await PositionsService.getPositionById(positionId);
      setFormData({
        Symbol: position.Symbol || "",
        StopLoss: position.StopLoss || "0.000",
        TakeProfit: position.TakeProfit || "0.000",
        TradeDirection: position.TradeDirection || "",
      });
    } catch (error) {
      console.error("❌ Error al cargar la posición:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await PositionsService.updatePosition(positionId, formData);
      alert("✅ Posición actualizada con éxito.");
      onClose();
    } catch (error) {
      console.error("❌ Error al actualizar la posición:", error);
      alert("❌ No se pudo actualizar la posición.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteText.toLowerCase() !== "eliminar") {
      Alert.alert("Error", "Debes escribir la palabra 'eliminar' para confirmar.");
      return;
    }

    setLoading(true);
    try {
      await PositionsService.deletePosition(positionId);
      alert("🗑️ Posición eliminada con éxito.");
      onClose();
    } catch (error) {
      console.error("❌ Error al eliminar la posición:", error);
      alert("❌ No se pudo eliminar la posición.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Card style={[styles.card, { backgroundColor: colors.bacground_white }]}>
          <Card.Title
            title="Editar Posición"
            titleStyle={{
              color: colors.primary,
              fontFamily: fonts.Raleway.bold,
              fontSize: fontSizes.large,
              textAlign: "center",
            }}
            right={() => (
              <View style={{ flexDirection: "row" }}>
                <IconButton
                  icon="trash-can"
                  color="red"
                  size={24}
                  onPress={() => setDeleteMode(true)} // Activa el modo eliminación
                />
                <IconButton
                  icon="close"
                  color={colors.primary}
                  size={24}
                  onPress={onClose}
                />
              </View>
            )}
          />
          <Card.Content>
            <TextInput
              label="Símbolo"
              value={formData.Symbol}
              mode="outlined"
              style={styles.input}
              disabled // 🔹 No se puede modificar
              theme={{
                colors: {
                  primary: colors.primary,
                  text: colors.text_black,
                  placeholder: colors.text_black,
                },
              }}
            />

            <TextInput
              label="Stop Loss"
              value={formData.StopLoss}
              onChangeText={(text) => setFormData({ ...formData, StopLoss: text })}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              theme={{
                colors: {
                  primary: colors.primary,
                  text: colors.text_black,
                  placeholder: colors.text_black,
                },
              }}
            />

            <TextInput
              label="Take Profit"
              value={formData.TakeProfit}
              onChangeText={(text) => setFormData({ ...formData, TakeProfit: text })}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              theme={{
                colors: {
                  primary: colors.primary,
                  text: colors.text_black,
                  placeholder: colors.text_black,
                },
              }}
            />

            <TextInput
              label="Dirección del Trade"
              value={formData.TradeDirection}
              onChangeText={(text) => setFormData({ ...formData, TradeDirection: text })}
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: colors.primary,
                  text: colors.text_black,
                  placeholder: colors.text_black,
                },
              }}
            />

            {/* 🔴 Campo para confirmar eliminación solo si deleteMode es true */}
            {deleteMode && (
              <View style={styles.deleteContainer}>
                <TextInput
                  label="Escribe 'eliminar' para borrar"
                  value={deleteText}
                  onChangeText={setDeleteText}
                  mode="outlined"
                  style={styles.inputDelete}
                  theme={{
                    colors: {
                      primary: "red",
                      text: colors.text_black,
                      placeholder: colors.text_black,
                    },
                  }}
                />
                <Button
                  mode="contained"
                  onPress={handleDelete}
                  style={[styles.buttonDelete, { backgroundColor: "red" }]}
                  labelStyle={{
                    color: colors.text,
                    fontFamily: fonts.Raleway.bold,
                    fontSize: fontSizes.medium,
                  }}
                >
                  Confirmar Eliminación
                </Button>
              </View>
            )}
          </Card.Content>
          <Card.Actions style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              style={[styles.button, { backgroundColor: colors.primary }]}
              labelStyle={{
                color: colors.text_black,
                fontFamily: fonts.Raleway.bold,
                fontSize: fontSizes.medium,
              }}
            >
              Guardar
            </Button>
            <Button
              mode="outlined"
              onPress={onClose}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={{
                color: colors.primary,
                fontFamily: fonts.Raleway.medium,
                fontSize: fontSizes.medium,
              }}
            >
              Cancelar
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Espaciado en los bordes
  },
  card: {
    width: "100%",
    maxWidth: 500,
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 12,
    elevation: 5,
  },
  input: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  deleteContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#FFE6E6",
    borderRadius: 8,
  },
  inputDelete: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#FFE6E6",
  },
  buttonDelete: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
  },
});

export default SnackUpdatePosition;
