import { useEffect, useRef, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router"; // Manejo de navegación y reactivación
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import SnackLogo from "@/components/snacks/elements/SnackLogo"; // Logo
import { useTheme } from "@/hooks/useThemeProvider"; // Tema
import { useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons"; // Ícono del candado

export default function Index() {
  const router = useRouter(); // Instancia del router
  const { colors } = useTheme(); // Obtiene los colores del tema
  const progress = useRef(new Animated.Value(0)).current; // Referencia de animación
  const [showButtons, setShowButtons] = useState(false); // Estado para mostrar los botones

  // Función para iniciar la animación
  const startAnimation = () => {
    setShowButtons(false); // Oculta los botones al iniciar la animación
    progress.setValue(0); // Resetea la barra de progreso
    Animated.timing(progress, {
      toValue: 1, // Completa la animación
      duration: 3000, // Duración de 3 segundos
      useNativeDriver: false,
    }).start(() => {
      setShowButtons(true); // Muestra los botones cuando la animación termina
    });
  };

  // Detectar cuando el usuario vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      startAnimation(); // Reiniciar animación cada vez que la pantalla se enfoque
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo centrado y elevado */}
      <View style={styles.logoContainer}>
        <SnackLogo variant="white" width={250} />
      </View>

      {/* Texto de carga */}
      {!showButtons && (
        <>
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            Cargando la bitácora...
          </Text>

          {/* Barra de progreso animada */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.primary,
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"], // Anima de 0% a 100%
                  }),
                },
              ]}
            />
          </View>
        </>
      )}

      {/* Botones de acceso: Se muestran solo cuando la animación termina */}
      {showButtons && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.accessButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/manage-positions")}
          >
            <Text style={styles.buttonText}>Acceder a la Bitácora</Text>
          </TouchableOpacity>

          {/* Icono del candado para Login */}
          <TouchableOpacity
            style={styles.lockButton}
            onPress={() => router.push("/login")}
          >
            <MaterialIcons name="lock" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Centra verticalmente todo el contenido
    alignItems: "center", // Centra horizontalmente
    padding: 20,
  },
  logoContainer: {
    marginBottom: -30, // 🔹 Eleva el logo sin perder balance
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center", // Centra el texto
  },
  progressBarContainer: {
    width: "80%",
    height: 8,
    backgroundColor: "#E0E0E0", // Color de fondo de la barra
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  accessButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  lockButton: {
    marginLeft: 15,
    padding: 10,
    borderRadius: 8,
  },
});
