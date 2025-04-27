import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

type AudioItem = {
  _id: string;
  description: string;
  voice: string;
  url: string;
};

type Description = {
  _id: string;
  place: string;
  language: string;
  name: string;
  address: string;
  city: string;
  content: string;
  aiDesc: string;
  audios: AudioItem[];
};

type AudioPlayerProps = {
  language: string;
  descriptions: Description[];
  visible?: boolean;
  audio: string;
};

export default function AudioPlayer({
  language,
  descriptions,
  visible = true,
  audio,
}: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const playSound = async () => {
    if (!audio) return;
    setLoading(true);
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audio },
        { shouldPlay: true }
      );
      setSound(sound);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Lỗi khi phát âm thanh:", error);
    } finally {
      setLoading(false);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!visible && isPlaying) {
      stopSound();
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (!visible || !audio) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        onPress={isPlaying ? stopSound : playSound}
        style={{
          padding: 10,
          backgroundColor: "#8A2BE2",
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color="#fff"
          />
        )}
        <Text style={{ color: "#fff", marginLeft: 6 }}>
          {isPlaying ? "Dừng" : "Phát"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
