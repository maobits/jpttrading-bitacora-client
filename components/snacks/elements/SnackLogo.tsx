import React from "react";
import { Image, StyleSheet, View } from "react-native";
import PropTypes from "prop-types";

export default function SnackLogo({ variant = "black", width = 150 }) {
  const logoSource =
    variant === "white"
      ? require("../../../assets/images/logo-white.png")
      : require("../../../assets/images/logo-black.png");

  return (
    <View style={styles.container}>
      <Image
        source={logoSource} // Carga dinámica del logo
        style={[styles.logo, { width, height: width }]} // Ajusta el alto igual al ancho
        resizeMode="contain" // Ajusta la imagen sin distorsionarla
      />
    </View>
  );
}

SnackLogo.propTypes = {
  variant: PropTypes.oneOf(["black", "white"]), // Define los valores permitidos
  width: PropTypes.number, // Define el ancho como un número
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  logo: {
    maxWidth: "100%", // Asegura que no exceda el contenedor
  },
});
