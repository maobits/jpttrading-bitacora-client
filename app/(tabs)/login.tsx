import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import { useTheme } from "@/hooks/useThemeProvider"; // Importa el tema
import SnackLogin from "@/components/snacks/auth/SnackLogin"; // Importa el componente `SnackLogin`

export default function LoginScreen() {
  const { colors, fonts, fontSizes } = useTheme(); // Accede al tema personalizado

  return (
    <SafeAreaView style={styles.container}>
      <SnackLogin /> {/* Renderiza el componente de inicio de sesión */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0C0C", // Fondo oscuro como en el tema
    justifyContent: "center", // Centra el contenido verticalmente
    alignItems: "center", // Centra el contenido horizontalmente
    padding: 20, // Espaciado general
  },
  title: {
    marginBottom: 0, // Agrega separación entre el título y el resto
    textAlign: "center", // Alinea el texto al centro
  },
});
