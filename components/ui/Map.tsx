import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { useLocationStore } from "../../store/useLocationStore";

interface Place {
  id: number;
  name: string;
  lat: number;
  lon: number;
  audioUrl: string;
}

export default function Map() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { selectedLocation } = useLocationStore();
  const mapRef = useRef<MapView>(null);

  console.log(selectedLocation);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(
          "http://192.168.23.102:8081/shtem-restful-api/places"
        );

        console.log("place: ", response.data);
      } catch (err) {
        console.error("Error fetching places:", err);
      } finally {
      }
    };

    fetchPlaces();
  }, []);

  const fetchNearbyLocations = async (long: number, lat: number) => {
    console.log(long, lat);
    try {
      const res = await axios.get(
        `http://192.168.23.102:8081/shtem-restful-api/places/nearby?longitude=${long}&latitude=${lat}&distance=5000`
      );
      setPlaces(res.data);
      console.log("nearby: ", res.data);
    } catch (err) {
      console.error("Error fetching nearby places:", err);
    }
  };

  useEffect(() => {
    const subscribeToLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      return Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 100,
        },
        (loc) => {
          setLocation(loc);
          fetchNearbyLocations(loc.coords.longitude, loc.coords.latitude);
        }
      );
    };

    const subscriber = subscribeToLocation();

    return () => {
      subscriber.then((s) => s?.remove());
    };
  }, []);

  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lng) {
      const latitude = Number(selectedLocation.lat);
      const longitude = Number(selectedLocation.lng);

      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [selectedLocation]);
  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Đang lấy vị trí...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Marker vị trí hiện tại */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Bạn đang ở đây"
          description="Vị trí hiện tại"
        />

        {/* Marker cho các địa điểm gần đó */}
        {/* {places?.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.lat,
              longitude: place.lon,
            }}
            title={place.name}
            onPress={() => setSelectedPlace(place)}
          />
        ))} */}
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: Number(selectedLocation.lat),
              longitude: Number(selectedLocation.lng),
            }}
            title="Vị trí được chọn"
            pinColor="green"
          />
        )}
      </MapView>

      {/* Modal hiện thông tin và nút nghe audio */}
      <Modal
        visible={!!selectedPlace}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPlace(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPlace?.name}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (selectedPlace?.audioUrl) {
                  console.log("Playing audio:", selectedPlace.audioUrl);
                }
              }}
            >
              <Text style={styles.buttonText}>Nghe audio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#ccc" }]}
              onPress={() => setSelectedPlace(null)}
            >
              <Text style={styles.buttonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
