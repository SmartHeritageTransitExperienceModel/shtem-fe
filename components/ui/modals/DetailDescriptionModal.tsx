import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
};

const DetailDescriptionModal = ({
  visible,
  onClose,
  title,
  description,
}: Props) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Scrollable Description */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.description}>{description}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DetailDescriptionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "95%",
    height: "85%",
    borderRadius: 20,
    padding: 20,
    paddingTop: 48,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
});
