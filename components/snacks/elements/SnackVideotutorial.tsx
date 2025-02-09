import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview"; // Para móviles

interface SnackVideoTutorialProps {
  videoUrl: string;
  width?: number;
  height?: number;
}

export default function SnackVideoTutorial({
  videoUrl,
  width = 560, // Valor por defecto
  height = 315, // Valor por defecto
}: SnackVideoTutorialProps) {
  // Convertir enlace normal de YouTube a formato embebido
  const getEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:v=|\/embed\/|\/\d\/|\/vi\/|youtu\.be\/|\/v\/|\/e\/|watch\?v=|\/\?v=|&v=)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";
    return `https://www.youtube.com/embed/${videoId}?controls=1&showinfo=0`;
  };

  return (
    <View style={[styles.container, { width, height }]}>
      {Platform.OS === "web" ? (
        // Para Web: Usar iframe
        <iframe
          width={width}
          height={height}
          src={getEmbedUrl(videoUrl)}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        // Para Móvil: Usar WebView
        <WebView
          style={{ width, height }}
          source={{ uri: getEmbedUrl(videoUrl) }}
          allowsFullscreenVideo
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 20,
  },
});
