import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "@/hooks/useThemeProvider"; // Importa el tema
import { MaterialIcons } from "@expo/vector-icons"; // Librería de íconos

export default function TabLayout() {
  const { colors, fonts } = useTheme(); // Accede al tema personalizado

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
          },
          default: {
            backgroundColor: colors.background, // Fondo en otras plataformas
            marginBottom: 10, // Margen inferior en otras plataformas
          },
        }),
        tabBarLabelStyle: {
          fontFamily: fonts.Raleway.bold, // Fuente personalizada para las etiquetas
          fontSize: 14, // Tamaño fijo para las etiquetas
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
            <MaterialIcons name="login" size={24} color={color} />
          ), // Ícono para la pestaña Login
        }}
      />
    </Tabs>
  );
}
