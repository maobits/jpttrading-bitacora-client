import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GeneralToken from "@/store/config/GeneralToken.json";
import connectionService from "@/hooks/recipes/ConnectionService"; // Importa el servicio de conexión
import ENDPOINTS from "@/store/config/endpoints";

// Configurar cliente de Axios dinámicamente
const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper para obtener el token almacenado en sesión
const getSessionToken = async (): Promise<string | null> => {
  try {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log("🔑 Token de sesión obtenido:", parsedUser.accessToken);
      return parsedUser.accessToken || null;
    }
    console.log("ℹ️ No se encontró usuario almacenado.");
    return null;
  } catch (error) {
    console.error("❌ Error obteniendo el token de sesión:", error);
    throw new Error("No se pudo obtener el token de sesión.");
  }
};

// Helper para obtener el token general
const getGeneralToken = (): string => {
  console.log(
    "🔑 Token general cargado desde archivo JSON:",
    GeneralToken.token
  );
  return GeneralToken.token;
};

const PositionsService = {
  // Obtener todas las posiciones abiertas.
  getAllPositions: async (): Promise<any> => {
    try {
      console.log(
        "🚀 Iniciando solicitud para obtener todas las posiciones..."
      );

      const { ip, port } = connectionService.getServerConfig();
      apiClient.defaults.baseURL = ENDPOINTS.POSITIONS;

      const token = getGeneralToken();

      const response = await apiClient.get("/", {
        headers: {
          "x-api-key": token, // Usar x-api-key en lugar de Authorization
        },
      });

      console.log("✅ Posiciones obtenidas exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al obtener posiciones:", error);
      throw error;
    }
  },

   // Obtener todas las posiciones cerradas.
   getAllClosedPositions: async (): Promise<any> => {
    try {
      console.log(
        "🚀 Iniciando solicitud para obtener todas las posiciones..."
      );

      const { ip, port } = connectionService.getServerConfig();
      apiClient.defaults.baseURL = ENDPOINTS.CLOSED_POSITIONS;

      const token = getGeneralToken();

      const response = await apiClient.get("/", {
        headers: {
          "x-api-key": token, // Usar x-api-key en lugar de Authorization
        },
      });

      console.log("✅ Posiciones obtenidas exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al obtener posiciones:", error);
      throw error;
    }
  },

getClosedPositionsWithFilter: async (months: number): Promise<any> => {
  try {
    console.log(
      `🚀 Solicitando posiciones cerradas con antigüedad de ${months} meses...`
    );

    const { ip, port } = connectionService.getServerConfig();
    apiClient.defaults.baseURL = ENDPOINTS.CLOSED_POITIONS_WITH_FILTER;

    const token = getGeneralToken();

    // 📌 Se envía el número de meses como parámetro en la URL
    const response = await apiClient.get("/", {
      headers: {
        "x-api-key": token, // Usar x-api-key en lugar de Authorization
      },
      params: { months }, // 🔹 Parámetro para filtrar la antigüedad en meses
    });

    console.log(
      "✅ Posiciones cerradas obtenidas exitosamente con filtro:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error al obtener posiciones cerradas con filtro:",
      error.response?.data || error.message
    );
    throw error;
  }
},



  // Crear una posición
  createPosition: async (data: Record<string, unknown>): Promise<any> => {
    try {
      console.log("🚀 Iniciando solicitud para crear una posición...");

      const { ip, port } = connectionService.getServerConfig();
      apiClient.defaults.baseURL = ENDPOINTS.CREATE_POSITIONS;

      const token = await getSessionToken();

      const response = await apiClient.post("/", data, {
        headers: {
          "x-api-key": token, // Usar x-api-key en lugar de Authorization
        },
      });

      console.log("✅ Posición creada exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al crear posición:", error);
      throw error;
    }
  },

  // Obtener posición por ID
  getPositionById: async (id: string): Promise<any> => {
    try {
      console.log(
        `🚀 Iniciando solicitud para obtener la posición con ID: ${id}`
      );

      const { ip, port } = connectionService.getServerConfig();
      apiClient.defaults.baseURL = ENDPOINTS.POSITIONS;

      const token = getGeneralToken();

      const response = await apiClient.get(`/${id}`, {
        headers: {
          "x-api-key": token, // Usar x-api-key en lugar de Authorization
        },
      });

      console.log(
        `✅ Posición con ID ${id} obtenida exitosamente:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener la posición con ID ${id}:`, error);
      throw error;
    }
  },

  // Actualizar posición por ID
  updatePosition: async (
    id: string,
    data: Record<string, unknown>
  ): Promise<any> => {
    try {
      console.log(
        `🚀 Iniciando solicitud para actualizar la posición con ID: ${id}`
      );

      const { ip, port } = connectionService.getServerConfig();
      apiClient.defaults.baseURL = ENDPOINTS.POSITIONS;

      const token = await getSessionToken();

      const response = await apiClient.patch(`/${id}`, data, {
        headers: {
          "x-api-key": token, // Usar x-api-key en lugar de Authorization
        },
      });

      console.log(
        `✅ Posición con ID ${id} actualizada exitosamente:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar la posición con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar posición por ID
  deletePosition: async (id: string): Promise<{ message: string }> => {
    try {
      console.log(
        `🚀 Iniciando solicitud para eliminar la posición con ID: ${id}`
      );

      const { ip, port } = connectionService.getServerConfig();
      apiClient.defaults.baseURL = ENDPOINTS.POSITIONS;

      const token = await getSessionToken();

      await apiClient.delete(`/${id}`, {
        headers: {
          "x-api-key": token, // Usar x-api-key en lugar de Authorization
        },
      });

      console.log(`✅ Posición con ID ${id} eliminada exitosamente.`);
      return { message: "Posición eliminada con éxito" };
    } catch (error) {
      console.error(`❌ Error al eliminar la posición con ID ${id}:`, error);
      throw error;
    }
  },
};

export default PositionsService;
