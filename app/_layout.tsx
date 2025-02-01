import { AuthProvider } from "@/hooks/recipes/authService";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ThemeProvider } from "@/hooks/useThemeProvider";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import "react-native-reanimated";
import "normalize.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define your custom theme for React Native Paper
const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6200ee", // Your primary color
    accent: "#03dac4", // Your accent color
    background: "#f6f6f6", // Background color
    surface: "#ffffff", // Surface color
    text: "#000000", // Default text color
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Raleway-Regular": require("../assets/fonts/Raleway-Regular.ttf"),
    "Raleway-Bold": require("../assets/fonts/Raleway-Bold.ttf"),
    "Raleway-ExtraBold": require("../assets/fonts/Raleway-ExtraBold.ttf"),
    "Raleway-Light": require("../assets/fonts/Raleway-Light.ttf"),
    "Raleway-Medium": require("../assets/fonts/Raleway-Medium.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <PaperProvider theme={paperTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
