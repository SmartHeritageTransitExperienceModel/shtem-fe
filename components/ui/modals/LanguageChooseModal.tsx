import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";

import { useLocationStore } from "../../../store/useLocationStore";

interface LanguageChooseModalProps {
  languageModalVisible: boolean;
  toggleLanguageModal: () => void;
  onClose: () => void;
}

export default function LanguageChooseModal({
  languageModalVisible,
  toggleLanguageModal,
  onClose,
}: LanguageChooseModalProps) {
  const { setLanguage } = useLocationStore();
  return (
    <Modal
      transparent
      animationType="fade"
      visible={languageModalVisible}
      onRequestClose={toggleLanguageModal}
    >
      <Pressable style={styles.modalOverlay} onPress={toggleLanguageModal}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            onPress={() => {
              setLanguage("vi");
              onClose();
            }}
          >
            <Text style={styles.modalOption}>Tiếng Việt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setLanguage("en");
              onClose();
            }}
          >
            <Text style={styles.modalOption}>English</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
