import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";

export default function OfflineScreen() {
  const { colors, fonts } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MaterialIcons name="cloud-off" size={50} color={colors.text} />
      <Text
        style={[
          styles.message,
          { color: colors.text, fontFamily: fonts.Montserrat.bold },
        ]}
      >
        ⚠️ Servidores en mantenimiento ⚠️
      </Text>
      <Text
        style={[
          styles.subMessage,
          { color: "#F2B705", fontFamily: fonts.Montserrat.regular },
        ]}
      >
        Por favor, contacta al equipo de computación en la nube. ☁️
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 10,
  },
  subMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
  },
});
