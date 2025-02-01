import React, { createContext, useContext } from "react";

const ThemeContext = createContext();

const theme = {
    colors: {
        background: "#0C0C0C",
        bacground_white: "#FFFFFF",
        primary: "#F2B705",
        secondary: "#F29F05",
        text: "#FFFFFF",
        text_black: "#0C0C0C"
    },
    fonts: {
        Montserrat: {
            regular: "Montserrat-Regular",
            bold: "Montserrat-Bold",
            extraBold: "Montserrat-ExtraBold",
            light: "Montserrat-Light",
            medium: "Montserrat-Medium",
        },
        Raleway: {
            regular: "Raleway-Regular",
            bold: "Raleway-Bold",
            extraBold: "Raleway-ExtraBold",
            light: "Raleway-Light",
            medium: "Raleway-Medium",
        },
    },
    fontSizes: {
        small: 12,
        medium: 16,
        large: 20,
        extraLarge: 24,
    },
};

export const ThemeProvider = ({ children }) => {
    return (
        <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
