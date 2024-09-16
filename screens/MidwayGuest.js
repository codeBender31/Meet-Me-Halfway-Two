//A screen for users to try out our product before they sign up
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Map from './Map';
import { determineGlobalStyles } from '../components/Styles'; 

const MidwayGuest = () => {
  const { styles } = determineGlobalStyles();  

  const [selectedUserAddress, setSelectedUserAddress] = useState('');
  const [selectedFriendAddress, setSelectedFriendAddress] = useState('');


  const [userAddress, setUserAddress] = useState('');
  const [friendAddress, setFriendAddress] = useState('');


  const [midpoint, setMidpoint] = useState(null);
  const [midpointAddress, setMidpointAddress] = useState('');


  const calculateMidpoint = (location1, location2) => {
    const lat = (location1.lat + location2.lat) / 2;
    const lng = (location1.lng + location2.lng) / 2;
    return { lat, lng };
  };

 
  const reverseGeocodeMidpoint = async (lat, lng) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc`);
      const data = await response.json();
      return data.results[0]?.formatted_address || 'Address not found';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Error retrieving address';
    }
  };

 
  const findMeetingPoint = async () => {
    if (userAddress && friendAddress) {
      const userLocation = userAddress.geometry.location;
      const friendLocation = friendAddress.geometry.location;
      const midpointCoordinates = calculateMidpoint(userLocation, friendLocation);
      setMidpoint(midpointCoordinates);

    
      const address = await reverseGeocodeMidpoint(midpointCoordinates.lat, midpointCoordinates.lng);
      setMidpointAddress(address);

   
      Alert.alert('Midpoint Details', `Coordinates: ${midpointCoordinates.lat}, ${midpointCoordinates.lng}\nAddress: ${address}`);
    } else {
      Alert.alert('Error', 'Please set both user and friend locations.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenText}>Find Midway Point</Text>

    
      <GooglePlacesAutocomplete
        placeholder="Enter User Address"
        onPress={(data, details = null) => {
          setSelectedUserAddress(details); 
        }}
        query={{
          key: 'AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc',
          language: 'en',
          components: 'country:us',
          types: 'address',
        }}
        styles={{
          container: { flex: 0, width: '100%', marginBottom: 10 },
          textInputContainer: { width: '100%', paddingHorizontal: 0 },
          textInput: { ...styles.input },
          listView: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', borderRadius: 8 },
        }}
        fetchDetails={true}
      />

      <TouchableOpacity
        style={styles.bigButton}
        onPress={() => {
          if (selectedUserAddress) {
            setUserAddress(selectedUserAddress); 
          } else {
            Alert.alert('Error', 'Please select a user address.');
          }
        }}
      >
        <Text style={styles.bigButtonText}>Set User Location</Text>
      </TouchableOpacity>

    
      <GooglePlacesAutocomplete
        placeholder="Enter Friend's Address"
        onPress={(data, details = null) => {
          setSelectedFriendAddress(details); 
        }}
        query={{
          key: 'AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc',
          language: 'en',
          components: 'country:us',
          types: 'address',
        }}
        styles={{
          container: { flex: 0, width: '100%', marginBottom: 10 },
          textInputContainer: { width: '100%', paddingHorizontal: 0 },
          textInput: { ...styles.input },
          listView: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', borderRadius: 8 },
        }}
        fetchDetails={true}
      />

    
      <TouchableOpacity
        style={styles.bigButton}
        onPress={() => {
          if (selectedFriendAddress) {
            setFriendAddress(selectedFriendAddress); 
          } else {
            Alert.alert('Error', 'Please select a friend\'s address.');
          }
        }}
      >
        <Text style={styles.bigButtonText}>Set Friend's Location</Text>
      </TouchableOpacity>

    
      <TouchableOpacity
        style={styles.bigButton}
        onPress={findMeetingPoint}
      >
        <Text style={styles.bigButtonText}>Find Meeting Point</Text>
      </TouchableOpacity>

    
      <Map userAddress={userAddress} friendAddress={friendAddress} midpoint={midpoint} />
    </View>
  );
};

export default MidwayGuest;
