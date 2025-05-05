import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Button,
  Modal,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore } from "../store/useLocationStore";

type AudioItem = {
  _id: string;
  description: string;
  voice: string;
  url: string;
};

type AudioPlayerProps = {
  title?: string;
  audios: AudioItem[];
  images?: string[];
  visible: boolean;
  onClose: () => void;
};

export default function AudioPlayer({
  title,
  audios,
  images = [],
  onClose,
  visible = true,
}: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { language } = useLocationStore();

  // Image slideshow logic
  useEffect(() => {
    if (!visible || images.length <= 1) return;

    slideTimer.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [visible, images]);

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Audio playback logic
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

          {/* === Image Slider === */}
          {images.length > 0 && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: images[currentImageIndex] }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.navigationButtons}>
                <TouchableOpacity onPress={prevSlide} style={styles.navBtn}>
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextSlide} style={styles.navBtn}>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.dots}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentImageIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* === Audio Selection === */}
          <View style={styles.audioList}>
            {audios?.map((audio, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectVoice(audio.url)}
                style={styles.audioItem}
              >
                <Text style={styles.voiceText}>{audio.voice}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* === Play / Stop Button === */}
          <TouchableOpacity
            onPress={
              isPlaying ? stopSound : () => playSound(currentAudio || "")
            }
            style={styles.playButton}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                {language === "en"
                  ? isPlaying
                    ? "Pause"
                    : "Play"
                  : isPlaying
                  ? "Dừng"
                  : "Phát"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* === Close Button === */}
          <View style={{ marginTop: 12, borderRadius: 8 }}>
            <Button
              title={language === "en" ? "Close" : "Đóng"}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==========================
// Styles
// ==========================
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
    minWidth: 280,
    maxWidth: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  imageContainer: {
    width: 250,
    height: 160,
    position: "relative",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  navigationButtons: {
    position: "absolute",
    top: "40%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  navBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderRadius: 20,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#8A2BE2",
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
  playButton: {
    padding: 10,
    backgroundColor: "#8A2BE2",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
});
