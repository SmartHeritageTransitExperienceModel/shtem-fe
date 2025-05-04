import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "../../../utils/useDebounce";
import CountryFlag from "react-native-country-flag";
import Icon from "react-native-vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  BackHandler,
  FlatList,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ExitConfirmModal from "../modals/ExitConfirmModal";
import LanguageChooseModal from "../modals/LanguageChooseModal";
import { useLocationStore } from "../../../store/useLocationStore";
import axios from "axios";

export default function Header() {
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<
    { place_id: number; display_name: string }[]
  >([]);

  const { language, setSelectedLocation } = useLocationStore();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const toggleLanguageModal = () => {
    setLanguageModalVisible(!languageModalVisible);
  };

  const confirmExit = () => {
    setExitModalVisible(true);
  };

  const exitApp = () => {
    BackHandler.exitApp();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          debouncedQuery
        )}&format=json`;

        const res = await fetch(url, {
          headers: {
            "User-Agent": "HihiMaps/1.0 (dbao09107@gmail.com)",
          },
        });

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Lỗi fetch location:", err);
      }
    };

    fetchLocations();
  }, [debouncedQuery]);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={toggleLanguageModal}
          style={styles.languageButton}
        >
          <CountryFlag isoCode={language === "vi" ? "vn" : "gb"} size={25} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.title}>SHTem</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmExit}>
          <Icon name="exit-outline" size={24} />{" "}
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
        {(searchQuery.length > 0 || results.length > 0) && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => {
                setSearchQuery(item.display_name);
                setResults([]);
                Keyboard.dismiss();
                setSelectedLocation(item as any);
              }}
            >
              <Text style={styles.resultText}>{item.display_name}</Text>
            </TouchableOpacity>
          )}
          style={styles.resultList}
        />
      )}

      <LanguageChooseModal
        languageModalVisible={languageModalVisible}
        toggleLanguageModal={toggleLanguageModal}
        onClose={() => setLanguageModalVisible(false)}
      />

      <ExitConfirmModal
        exitModalVisible={exitModalVisible}
        setExitModalVisible={setExitModalVisible}
        exitApp={exitApp}
      />
    </>
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
    paddingVertical: 7,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  resultList: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    fontSize: 16,
    color: "#333",
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
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "bold",
  },
});
