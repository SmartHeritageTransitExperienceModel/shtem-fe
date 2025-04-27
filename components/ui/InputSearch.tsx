import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<
    { place_id: number; display_name: string }[]
  >([]);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleLanguageModal = () => {
    setLanguageModalVisible(!languageModalVisible);
  };

  const selectLanguage = (lang: string) => {
    setLanguageModalVisible(false);
  };

  const confirmExit = () => {
    setExitModalVisible(true);
  };

  const exitApp = () => {
    // Handle exit app logic
  };

  useEffect(() => {
    const fetchLocations = async () => {
      if (searchQuery.length < 2) return;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchQuery
      )}&format=json`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "HihiMaps/1.0 (dbao09107@gmail.com)",
        },
      });
      const data = await res.json();
      setResults(data);
    };
    const timeout = setTimeout(fetchLocations, 300);

    if (results.length > 0) {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setDropdownVisible(false));
    }

    return () => clearTimeout(timeout);
  }, [searchQuery, results]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setResults([]);
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleLanguageModal}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Hihi Maps</Text>
          <TouchableOpacity onPress={confirmExit}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập vị trí..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={(e) => setSearchQuery(e)}
          />
        </View>

        {isDropdownVisible && (
          <Animated.View
            style={[
              styles.resultList,
              {
                opacity: dropdownAnim,
                transform: [
                  {
                    scaleY: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <FlatList
              data={results}
              keyExtractor={(item) => item.place_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => {
                    setSearchQuery(item.display_name);
                    setResults([]);
                    console.log("Đã chọn:", item.display_name);
                  }}
                >
                  <Text>{item.display_name}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        )}

        {/* Modal chọn ngôn ngữ */}
        <Modal
          transparent
          animationType="fade"
          visible={languageModalVisible}
          onRequestClose={toggleLanguageModal}
        >
          <Pressable style={styles.modalOverlay} onPress={toggleLanguageModal}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={() => selectLanguage("vi")}>
                <Text style={styles.modalOption}>Tiếng Việt</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectLanguage("en")}>
                <Text style={styles.modalOption}>English</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Modal xác nhận thoát */}
        <Modal
          transparent
          animationType="fade"
          visible={exitModalVisible}
          onRequestClose={() => setExitModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setExitModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Bạn có muốn thoát ứng dụng không?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setExitModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Không</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={exitApp}>
                  <Text style={styles.confirmText}>Có</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#8A2BE2",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  resultList: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    overflow: "hidden",
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    minWidth: 250,
  },
  modalOption: {
    fontSize: 18,
    paddingVertical: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
  },
  confirmText: {
    color: "#8A2BE2",
    fontSize: 16,
    fontWeight: "bold",
  },
});
