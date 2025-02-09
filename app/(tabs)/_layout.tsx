import { Tabs } from "expo-router";
import React from "react";
import { Platform, Dimensions } from "react-native";
import { useTheme } from "@/hooks/useThemeProvider"; // Importa el tema
import { MaterialIcons } from "@expo/vector-icons"; // Librería de íconos

export default function TabLayout() {
  const { colors, fonts } = useTheme(); // Accede al tema personalizado
  const screenWidth = Dimensions.get("window").width; // Obtener el ancho de la pantalla
  const screenHeight = Dimensions.get("window").height; // Obtener el alto de la pantalla

  // Determinamos un tamaño de fuente dinámico basado en el tamaño de pantalla
  const dynamicFontSize = screenWidth < 375 ? 12 : screenWidth < 768 ? 14 : 16; // Ajusta en móviles y tablets
  const dynamicIconSize = screenWidth < 375 ? 20 : 24; // Ajuste de tamaño de iconos en pantallas pequeñas

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary, // Color del ítem activo
        tabBarInactiveTintColor: colors.text, // Color del ítem inactivo
        tabBarStyle: {
          backgroundColor: colors.background, // Fondo desde el tema
          position: "absolute", // Asegura que no se desborde en pantallas pequeñas
          bottom: 0, // Asegura que el menú siempre esté visible
          left: 0,
          right: 0,
          height: screenHeight * 0.08, // Ajuste dinámico de altura del menú
          maxHeight: 80, // Máxima altura en tablets
          minHeight: 50, // Altura mínima en pantallas pequeñas
          paddingVertical: screenWidth < 375 ? 5 : 10, // Ajusta espaciado para pantallas pequeñas
          borderTopWidth: 0, // Sin borde superior para un diseño limpio
        },
        tabBarLabelStyle: {
          fontFamily: fonts.Raleway.bold, // Fuente personalizada para las etiquetas
          fontSize: dynamicFontSize, // Ajuste dinámico para tamaño de fuente
          paddingBottom: 5, // Espaciado inferior para la etiqueta
          textAlign: "center", // Alinea el texto al centro
        },
        tabBarIconStyle: {
          paddingTop: 0, // Ajusta el espaciado superior de los íconos
          marginBottom: 2, // Ajusta el espaciado entre el ícono y el texto
          flexShrink: 1, // Evita que los iconos se desborden en pantallas pequeñas
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={dynamicIconSize} color={color} />
          ), // Ícono para la pestaña Home
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="login" size={dynamicIconSize} color={color} />
          ), // Ícono para la pestaña Login
        }}
      />
      <Tabs.Screen
        name="manage-positions"
        options={{
          title: "Administrar posiciones",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={dynamicIconSize} color={color} />
          ), // Ícono para la pestaña Administrar posiciones
        }}
      />
    </Tabs>
  );
}
