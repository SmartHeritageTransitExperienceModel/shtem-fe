import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  BackHandler,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ExitConfirmModal from "../modals/ExitConfirmModal";
import LanguageChooseModal from "../modals/LanguageChooseModal";
import { useLocationStore } from "../../../store/useLocationStore";

export default function Header() {
  console.log("first render");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<
    { place_id: number; display_name: string }[]
  >([]);

  const { language } = useLocationStore();

  const toggleLanguageModal = () => {
    setLanguageModalVisible(!languageModalVisible);
  };

  const selectLanguage = (lang: string) => {
    console.log("Selected language:", lang);
    setLanguageModalVisible(false);
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
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }
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

    console.log(results);
    console.log(searchQuery);
    const timeout = setTimeout(fetchLocations, 100);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleLanguageModal}>
          <Text style={styles.title}>{language === "vi" ? "Vi" : "En"}</Text>
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
                console.log("Đã chọn:", item.display_name);
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
});
