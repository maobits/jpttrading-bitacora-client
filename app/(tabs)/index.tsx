import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router"; // Importa la navegación
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useThemeProvider"; // Importa el tema

export default function Index() {
  const router = useRouter(); // Instancia del router
  const navigationState = useRootNavigationState(); // Verifica si el router está montado
  const { colors } = useTheme(); // Obtiene los colores del tema

  useEffect(() => {
    if (navigationState?.key) {
      router.push("/manage-positions"); // Solo navega cuando el router está listo
    }
  }, [navigationState?.key]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
