import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export default function App() {
  const [region, setRegion] = useState({
    latitude: 60.20,
    longitude: 24.92,
    latitudeDelta: 0.03,
    longitudeDelta: 0.02,
  });

  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);

  // Hakee nykyisen sijainnin sovelluksen avautuessa
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.02,
      });
      setLocation({
        coords: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
      });
    })();
  }, []);

  // Koordinaattien hakeminen annetulle osoitteelle
  const getCoordinates = async (address) => {
    if (!address.trim()) {
      Alert.alert('This is not a valid address');
      return;
    }

    try {
      const response = await fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data.length > 0) {
        const coords = data[0];
        setRegion({
          latitude: parseFloat(coords.lat),
          longitude: parseFloat(coords.lon),
          latitudeDelta: 0.03,
          longitudeDelta: 0.02,
        });
        setLocation({
          coords: {
            latitude: parseFloat(coords.lat),
            longitude: parseFloat(coords.lon),
          },
        });
      } else {
        Alert.alert('Address not found');
      }
    } catch {
      Alert.alert('Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Current Location"
          />
        )}
      </MapView>

      {/* Näppäimistön piilottaminen, iPhone */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.searchBoxContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Enter address"
          onChangeText={(text) => setAddress(text)}
          value={address}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => getCoordinates(address)}
        >
          <Text style={styles.buttonText}>Show</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchBoxContainer: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#FF69B4',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
