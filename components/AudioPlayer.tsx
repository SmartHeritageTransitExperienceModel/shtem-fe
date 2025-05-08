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
import { Picker } from "@react-native-picker/picker";
import DetailDescriptionModal from "./ui/modals/DetailDescriptionModal";

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
  description?: string;
  onClose: () => void;
};

export default function AudioPlayer({
  title,
  audios,
  images = [],
  onClose,
  visible = true,
  description,
}: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(
    audios[0]?.url || ""
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(audios?.[0]?.url || "");
  const [showDetail, setShowDetail] = useState(false);
  const { language } = useLocationStore();

  useEffect(() => {
    if (audios?.length > 0) {
      setSelectedVoice(audios[0]?.url);
    }
  }, [audios]);

  console.log(audios, "audios");
  const handleChange = (url: any) => {
    setSelectedVoice(url);
    handleSelectVoice(url);
  };

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
    setCurrentAudio(audios[0]?.url || "");
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
          <TouchableOpacity
            onPress={() => {
              onClose();
              if (sound) {
                setCurrentAudio(null);
              }
            }}
            style={styles.closeIcon}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={{ marginBottom: 12 }}>
            <Text
              style={styles.description}
              numberOfLines={4}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
            {description && description.length > 100 && (
              <TouchableOpacity onPress={() => setShowDetail(true)}>
                <Text style={styles.viewMore}>Xem thêm</Text>
              </TouchableOpacity>
            )}
          </View>

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
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedVoice}
              onValueChange={(itemValue) => handleChange(itemValue)}
              style={styles.picker}
            >
              {audios?.map((audio, index) => (
                <Picker.Item
                  key={index}
                  label={audio.voice}
                  value={audio.url}
                />
              ))}
            </Picker>
          </View>

          {/* === Play / Stop Button === */}
          <TouchableOpacity
            onPress={
              isPlaying ? stopSound : () => playSound(currentAudio || "")
            }
            disabled={!audios.length}
            activeOpacity={0.7}
            style={[
              styles.playButton,
              { backgroundColor: isPlaying ? "#FF4C4C" : "#4CAF50" },
            ]}
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
        </View>
      </View>
      <DetailDescriptionModal
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        title={title || ""}
        description={description || ""}
      />
    </Modal>
  );
}
const styles = StyleSheet.create({
  dropdownContainer: {
    marginTop: 10,
    width: 180,
    borderRadius: 12,
    backgroundColor: "#f0f0f5",
    overflow: "hidden",
    borderColor: "#dcdcdc",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 55,
    width: "100%",
    color: "#333",
  },
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
    width: "100%",
    height: "auto",
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    alignContent: "center",
    textAlign: "center",
  },
  description: {
    paddingBottom: 10,
    fontSize: 14,
  },
  imageContainer: {
    width: 300,
    height: 180,
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
  viewMore: {
    color: "#8A2BE2",
    marginTop: 0,
    fontSize: 14,
    fontWeight: "500",
  },
});
