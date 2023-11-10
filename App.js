import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import axios from 'axios';

const App = () => {
  const [location, setLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [isCarNotListed, setIsCarNotListed] = useState(false);
  const [consumption, setConsumption] = useState('');
  const [accessToken, setAccessToken] = useState(null);

  const [price, setPrice] = useState('');
  const [car,setCar] = useState('');
  const [isMilesPerGallon, setIsMilesPerGallon] = useState(false);

  const handleSubmit = () => {
    alert(`Location: ${location}\nDestination: ${destination}\nCar not listed: ${isCarNotListed}\nConsumption: ${consumption} ${isMilesPerGallon ? 'mpg' : 'km/l'}\nPrice: ${price} per ${isMilesPerGallon ? 'gallon' : 'liter'}`);
  };

const handleUberLogin = () => {
  const CLIENT_ID = 'YOUR_UBER_CLIENT_ID';
  const REDIRECT_URI = 'YOUR_REDIRECT_URI';

  const authUrl = `https://login.uber.com/oauth/v2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`;

  return (
    <WebView
      source={{ uri: authUrl }}
      onNavigationStateChange={(navState) => {
        if (navState.url.startsWith(REDIRECT_URI)) {
          const code = navState.url.split('code=')[1];
          exchangeCodeForToken(code);
        }
      }}
    />
  );
};
const exchangeCodeForToken = async (code) => {
  const CLIENT_ID = 'YOUR_UBER_CLIENT_ID';
  const CLIENT_SECRET = 'YOUR_UBER_CLIENT_SECRET';
  const REDIRECT_URI = 'YOUR_REDIRECT_URI';

  try {
    const response = await axios.post('https://login.uber.com/oauth/v2/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: code,
      grant_type: 'authorization_code',
    });

    setAccessToken(response.data.access_token);
  } catch (error) {
    console.error(error);
  }
};


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const calculateCostWithUber = async () => {
    try {
      const response = await axios.get('https://api.uber.com/v1.2/estimates/price', {
        params: {
          start_latitude: location.coords.latitude,
          start_longitude: location.coords.longitude,
          end_latitude: destination.coords.latitude,
          end_longitude: destination.coords.longitude,
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept-Language': 'en_US',
          'Content-Type': 'application/json',
        },
      });
  
      const prices = response.data.prices;
      // Do something with the prices...
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel Information</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="location-on" size={24} color="black" />
        <GooglePlacesAutocomplete
          placeholder="Enter your location"
          onPress={(data, details = null) => {
            setLocation(data.description);
          }}
          query={{
            key: 'AIzaSyATR4shLx3yAHIijF8AinfuZdG0bc-lTEU',
            language: 'en',
            country: 'ke',
          }}
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialIcons name="directions" size={24} color="black" />
        <GooglePlacesAutocomplete
          placeholder="Enter your destination"
          onPress={(data, details = null) => {
            setDestination(data.description);
          }}
          query={{
            key: 'AIzaSyATR4shLx3yAHIijF8AinfuZdG0bc-lTEU',
            language: 'en',
            country: 'ke',

          }}
        />
      </View>
      {isCarNotListed ? (
        <View style={styles.inputContainer}>
          <MaterialIcons name="local-gas-station" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder={`Enter your car's consumption (${isMilesPerGallon ? 'mpg' : 'km/l'})`}
            onChangeText={setConsumption}
            keyboardType="numeric"
          />
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <MaterialIcons name="drive-eta" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Enter your car"
            onChangeText={setCar}
          />
        </View>
      )}
      <View style={styles.switchContainer}>
        <Text>Is your car not listed?</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isCarNotListed ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setIsCarNotListed}
          value={isCarNotListed}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text>Consumption (toggle for mpg)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isMilesPerGallon ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setIsMilesPerGallon}
          value={isMilesPerGallon}
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialIcons name="attach-money" size={24} color="black" />
        <TextInput
          style={styles.input}
          placeholder={`Enter price per ${isMilesPerGallon ? 'gallon' : 'liter'}`}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default App;
