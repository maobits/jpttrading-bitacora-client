import { Tabs } from "expo-router";
import React from "react";
import { Platform, Dimensions } from "react-native";
import { useTheme } from "@/hooks/useThemeProvider"; // Importa el tema
import { MaterialIcons } from "@expo/vector-icons"; // Librería de íconos

export default function TabLayout() {
  const { colors, fonts } = useTheme(); // Accede al tema personalizado
  const screenWidth = Dimensions.get("window").width; // Obtener el ancho de la pantalla

  // Determinamos un tamaño de fuente dinámico basado en el tamaño de pantalla
  const dynamicFontSize = screenWidth < 375 ? 12 : 14; // Reducir fuente para pantallas pequeñas

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary, // Color del ítem activo
        tabBarInactiveTintColor: colors.text, // Color del ítem inactivo
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute", // Transparente en iOS
            backgroundColor: colors.background, // Fondo desde el tema
            borderTopWidth: 0, // Sin borde superior
            marginBottom: 10, // Margen inferior para separarlo de la parte baja
            paddingVertical: 10, // Espaciado vertical en iOS
          },
          android: {
            backgroundColor: colors.background, // Fondo en Android
            marginBottom: 10, // Margen inferior en Android
            paddingVertical: 10, // Espaciado vertical en Android
          },
          default: {
            backgroundColor: colors.background, // Fondo en otras plataformas
            marginBottom: 10, // Margen inferior en otras plataformas
            paddingVertical: 10, // Espaciado vertical general
          },
        }),
        tabBarLabelStyle: {
          fontFamily: fonts.Raleway.bold, // Fuente personalizada para las etiquetas
          fontSize: dynamicFontSize, // Ajuste dinámico para tamaño de fuente
          paddingBottom: 5, // Espaciado inferior para la etiqueta
          textAlign: "center", // Alinea el texto al centro
        },
        tabBarIconStyle: {
          paddingTop: 0, // Ajusta el espaciado superior de los íconos
          marginBottom: 2, // Ajusta el espaciado entre el ícono y el texto
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ), // Ícono para la pestaña Home
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="login" size={24} color={color} />
          ), // Ícono para la pestaña Login
        }}
      />
      <Tabs.Screen
        name="manage-positions"
        options={{
          title: "Administrar posiciones",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ), // Ícono para la pestaña Administrar posiciones
        }}
      />
    </Tabs>
  );
}
