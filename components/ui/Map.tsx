import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  Button,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { useLocationStore } from "../../store/useLocationStore";
import AudioPlayer from "../AudioPlayer";

interface Place {
  location: any;
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
  interface DetailPlace {
    descriptions: { name: string }[];
    images: string[];
  }

  const [selectedDetailPlace, setSelectedDetailPlace] =
    useState<DetailPlace | null>(null);
  const { selectedLocation } = useLocationStore();
  const [audio, setAudio] = useState([]);
  const mapRef = useRef<MapView>(null);
  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [descriptions, setDescriptions] = useState();
  const { language } = useLocationStore();

  const handleSelectPlace = (place: Place) => {
    setAudioModalVisible(true);
    setSelectedPlace(place);
  };

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const response = await axios.get(
          selectedPlace
            ? `http://192.168.1.101:2808/shtem-restful-api/places/${selectedPlace.id}?lang=${language}`
            : ""
        );
        setAudio(
          response.data.descriptions[0].audios.map((audio: any) => ({
            url: audio.url,
            voice: audio.voice,
          }))
        );
        setDescriptions(response.data.descriptions[0].content);
        setSelectedDetailPlace(response.data);
        console.log("audio", response.data.descriptions[0].audios[0].url);
      } catch (err) {
      } finally {
      }
    };

    fetchAudio();
  }, [selectedPlace]);

  const fetchNearbyLocations = async (long: number, lat: number) => {
    try {
      const res = await axios.get(
        `http://192.168.1.101:2808/shtem-restful-api/places/nearby?longitude=${long}&latitude=${lat}&distance=5000000`
      );
      setPlaces(res.data);
    } catch (err) {
      console.log("Lỗi gọi API nearby: ", err);
      ToastAndroid.show(
        "Không thể lấy danh sách địa điểm gần bạn. Vui lòng thử lại.",
        ToastAndroid.LONG
      );
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      if (location) {
        const { latitude, longitude } = location.coords;
        fetchNearbyLocations(longitude, latitude);
        ToastAndroid.show("Phát hiện địa điểm gần bạn", ToastAndroid.SHORT);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [location]);

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
        {places?.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.location.coordinates[1],
              longitude: place.location.coordinates[0],
            }}
            title={place.name}
            onPress={() => handleSelectPlace(place)}
          />
        ))}
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
      {selectedPlace && (
        <AudioPlayer
          audios={audio}
          visible={audioModalVisible}
          onClose={() => setAudioModalVisible(false)}
          title={selectedDetailPlace?.descriptions[0].name || "No Name"}
          images={selectedDetailPlace?.images}
          description={descriptions}
        />
      )}

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
