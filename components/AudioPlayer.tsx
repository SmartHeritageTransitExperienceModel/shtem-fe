import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Button,
  Modal,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

type AudioItem = {
  _id: string;
  description: string;
  voice: string;
  url: string;
};

type AudioPlayerProps = {
  title?: string;
  audios: AudioItem[]; // Mảng audios được truyền từ parent
  visible: boolean;
  onClose: () => void;
};

export default function AudioPlayer({
  title,
  audios, // Mảng audios từ parent
  onClose,
  visible = true,
}: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const playSound = async (audioUrl: string) => {
    if (!audioUrl) return;
    setLoading(true);
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
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

  const handleSelectVoice = (url: string) => {
    setCurrentAudio(url);
    playSound(url);
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.audioList}>
            {audios?.map((audio) => (
              <TouchableOpacity
                key={audio._id}
                onPress={() => handleSelectVoice(audio.url)}
                style={styles.audioItem}
              >
                <Text style={styles.voiceText}>{audio.voice}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={
              isPlaying ? stopSound : () => playSound(currentAudio || "")
            }
            style={styles.playButton}
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

          <View style={{ marginTop: 12 }}>
            <Button title="Đóng" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 250,
  },
  playButton: {
    padding: 10,
    backgroundColor: "#8A2BE2",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  audioList: {
    marginTop: 10,
    width: "100%",
  },
  audioItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  voiceText: {
    fontSize: 16,
    textAlign: "center",
  },
});
