import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { useTheme } from "@/hooks/useThemeProvider";

// Importar Lottie dinámicamente según la plataforma
const LottieView =
  Platform.OS === "web"
    ? require("lottie-react").default // Para web
    : require("lottie-react-native").default; // Para nativo

// Definir las props
interface LottieExceptionProps {
  message: string; // Mensaje a mostrar junto a la animación
}

const LottieException: React.FC<LottieExceptionProps> = ({ message }) => {
  const { colors, fonts, fontSizes } = useTheme();

  return (
    <View style={styles.container}>
      <LottieView
        {...(Platform.OS === "web"
          ? { animationData: require("@/assets/animations/LottieError.json") } // Web usa animationData
          : { source: require("@/assets/animations/LottieError.json") })} // Nativo usa source
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text
        style={{
          color: colors.secondary,
          fontFamily: fonts.Montserrat.bold,
          fontSize: fontSizes.large,
          textAlign: "center",
          marginTop: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  lottie: {
    width: 200,
    height: 200,
  },
});

export default LottieException;
