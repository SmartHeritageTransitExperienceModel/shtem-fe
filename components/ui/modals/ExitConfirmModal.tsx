import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";

interface ExitConfirmModalProps {
  exitModalVisible: boolean;
  setExitModalVisible: (visible: boolean) => void;
  exitApp: () => void;
}

export default function ExitConfirmModal({
  exitModalVisible,
  setExitModalVisible,
  exitApp,
}: ExitConfirmModalProps) {
  return (
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
