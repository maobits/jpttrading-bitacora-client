import React, { useState, createContext, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import connectionService from "@/hooks/recipes/ConnectionService"; // Importar instancia del servicio
import axios from "axios"; // Asegúrate de instalar axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            console.log("🔄 Cargando usuario desde AsyncStorage...");
            try {
                const userData = await AsyncStorage.getItem("user");
                if (userData) {
                    console.log("✅ Usuario encontrado en almacenamiento local:", userData);
                    setUser(JSON.parse(userData));
                } else {
                    console.log("ℹ️ No se encontró usuario en almacenamiento local.");
                }
            } catch (error) {
                console.error("❌ Error al cargar la sesión desde AsyncStorage:", error);
            } finally {
                setLoading(false);
                console.log("✅ Carga de usuario finalizada.");
            }
        };

        loadUser();
    }, []);

    const login = async (username, token) => {
        console.log("🔄 Iniciando sesión...");
        const { ip, port } = connectionService.getServerConfig(); // Obtiene configuración del servidor
        const baseUrl = `http://${ip}/api/positions/login`;

        console.log("ℹ️ Configuración del servidor obtenida:", { ip, port, baseUrl });
        console.log("🔑 Enviando solicitud al servidor con token:", token);

        try {
            const response = await axios.post(
                baseUrl,
                {}, // Cuerpo vacío, ya que el token está en el encabezado
                {
                    headers: {
                        "x-api-key": token, // Token en el encabezado
                    },
                }
            );

            console.log("✅ Respuesta del servidor recibida:", response.data);

            if (response.status === 200 && response.data.code === "API_KEY_VALID") {
                const userData = { username, accessToken: response.data.token };
                console.log("✅ Sesión válida. Guardando usuario en AsyncStorage:", userData);

                await AsyncStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);

                console.log("✅ Usuario guardado con éxito. Sesión iniciada.");
                return { success: true };
            } else {
                console.error("❌ Error de autenticación:", response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            if (error.response) {
                console.error("❌ Error del servidor:", error.response.data);
                return { success: false, message: error.response.data.message || "Error en el servidor." };
            }
            console.error("❌ Error en la autenticación:", error.message);
            return { success: false, message: "Error de conexión al servidor." };
        }
    };

    const logout = async () => {
        console.log("🔄 Cerrando sesión...");
        try {
            await AsyncStorage.removeItem("user");
            setUser(null);
            console.log("✅ Sesión cerrada y usuario eliminado de AsyncStorage.");
        } catch (error) {
            console.error("❌ Error al cerrar la sesión:", error);
        }
    };

    if (loading) {
        console.log("⏳ Mostrando estado de carga...");
        return null; // Muestra un estado de carga mientras se restaura la sesión
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
