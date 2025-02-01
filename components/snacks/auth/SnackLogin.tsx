import React, { useState } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useThemeProvider"; // Usar el tema personalizado
import { useAuth } from "@/hooks/recipes/authService"; // Servicio de autenticación
import SnackLogo from "@/components/snacks/elements/SnackLogo"; // Importa el componente del logo
import { useRouter } from "expo-router"; // Para manejar la navegación
import { TextInput, Button, Card, Title } from "react-native-paper";

export default function SnackLogin() {
  const { login, logout, user } = useAuth(); // Obtiene el usuario autenticado
  const { colors, fonts, fontSizes } = useTheme(); // Accede al tema personalizado
  const router = useRouter(); // Instancia del router para navegar

  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error

  const maskToken = (token) => {
    if (!token) return "";
    const visiblePart = token.slice(-4); // Últimos 4 caracteres visibles
    const maskedPart = "*".repeat(token.length - 4); // Oculta el resto con *
    return `${maskedPart}${visiblePart}`;
  };

  const handleLogin = async () => {
    if (!username || !accessToken) {
      setErrorMessage("Por favor, ingrese todos los campos.");
      return;
    }

    const result = await login(username, accessToken);
    if (!result.success) {
      setErrorMessage(result.message || "Error al iniciar sesión.");
    } else {
      setErrorMessage(""); // Limpia el mensaje de error si el inicio es exitoso
    }
  };

  const handleLogout = () => {
    logout();
    setErrorMessage(""); // Limpia el mensaje de error al cerrar sesión
  };

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        width: "100%", // Asegura que el contenedor ocupe el ancho total disponible
      }}
    >
      <SnackLogo variant="white" style={{ marginBottom: 20 }} />{" "}
      {/* Agrega el logo */}
      <Card
        style={{
          width: "90%", // Aumenta el porcentaje del ancho disponible
          maxWidth: 1200, // Mayor ancho máximo
          borderRadius: 15,
        }}
      >
        {user ? (
          // Si la sesión está iniciada, muestra la información del usuario
          <Card.Content>
            <Title
              style={{
                textAlign: "center",
                color: colors.text_black,
                fontFamily: fonts.Montserrat.bold,
                fontSize: fontSizes.extraLarge,
                marginBottom: 20,
              }}
            >
              Sesión Activa
            </Title>
            <Text
              style={{
                fontFamily: fonts.Montserrat.regular,
                fontSize: fontSizes.medium,
                color: colors.text_black,
                marginBottom: 10,
              }}
            >
              Usuario: {user.username}
            </Text>
            <Text
              style={{
                fontFamily: fonts.Montserrat.regular,
                fontSize: fontSizes.medium,
                color: colors.text_black,
              }}
            >
              Token: {maskToken(user.accessToken)}
            </Text>
            {/* Botón para gestionar posiciones */}
            <Button
              mode="contained"
              onPress={() => router.push("/manage-positions")}
              style={{
                marginTop: 20,
                backgroundColor: colors.primary,
              }}
              labelStyle={{
                color: colors.text_black,
                fontFamily: fonts.Raleway.bold,
                fontSize: fontSizes.medium,
              }}
            >
              Gestionar Posiciones
            </Button>
          </Card.Content>
        ) : (
          // Si no hay sesión iniciada, muestra el formulario de inicio
          <Card.Content>
            <Title
              style={{
                textAlign: "center",
                color: colors.text_black,
                fontFamily: fonts.Montserrat.bold,
                fontSize: fontSizes.extraLarge,
                marginBottom: 20,
              }}
            >
              Iniciar Sesión
            </Title>
            {errorMessage ? (
              <Text
                style={{
                  color: colors.secondary, // Color del mensaje de error
                  fontFamily: fonts.Montserrat.bold, // Fuente en negrita
                  fontSize: fontSizes.large, // Tamaño más grande
                  marginBottom: 20, // Espaciado inferior
                  textAlign: "center", // Centrado
                }}
              >
                {errorMessage}
              </Text>
            ) : null}
            <TextInput
              label="Nombre de Usuario"
              mode="outlined"
              value={username}
              onChangeText={setUsername}
              style={{
                fontFamily: fonts.Montserrat.regular,
                fontSize: fontSizes.medium,
                marginBottom: 15,
              }}
              outlineColor={colors.primary}
              activeOutlineColor={colors.secondary}
              theme={{
                colors: {
                  text: colors.text_black,
                  placeholder: colors.text,
                },
              }}
            />
            <TextInput
              label="Token de Acceso"
              mode="outlined"
              value={accessToken}
              onChangeText={setAccessToken}
              secureTextEntry
              style={{
                fontFamily: fonts.Montserrat.regular,
                fontSize: fontSizes.medium,
                marginBottom: 15,
              }}
              outlineColor={colors.primary}
              activeOutlineColor={colors.secondary}
              theme={{
                colors: {
                  text: colors.text_black,
                  placeholder: colors.text,
                },
              }}
            />
          </Card.Content>
        )}
        <Card.Actions
          style={{
            flexDirection: "row",
            justifyContent: "center",
            padding: 10,
          }}
        >
          {user ? (
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={{
                borderColor: colors.secondary,
              }}
              labelStyle={{
                color: colors.secondary,
                fontFamily: fonts.Raleway.medium,
                fontSize: fontSizes.medium,
              }}
            >
              Cerrar Sesión
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleLogin}
              style={{
                backgroundColor: colors.primary,
              }}
              labelStyle={{
                color: colors.text_black,
                fontFamily: fonts.Raleway.bold,
                fontSize: fontSizes.medium,
              }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Card.Actions>
      </Card>
    </View>
  );
}
