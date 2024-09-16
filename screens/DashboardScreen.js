import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Parse from 'parse/react-native.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Map from './Map'; 
import { determineGlobalStyles } from '../components/Styles';
import { createMeeting, openGoogleMaps } from '../models/Meeting'; 

const DashboardScreen = () => {
  let { styles } = determineGlobalStyles();

  const [username, setUsername] = useState('');
  const [selectedUserAddress, setSelectedUserAddress] = useState('');
  const [selectedFriendAddress, setSelectedFriendAddress] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [friendAddress, setFriendAddress] = useState('');
  const [midpoint, setMidpoint] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const [midpointAddress, setMidpointAddress] = useState('');
  const [time, setTime] = useState('12:00 PM');
  const [date, setDate] = useState(new Date());

  const navigation = useNavigation();

  useEffect(() => {
    const fetchFriends = async () => {
      const currentUser = Parse.User.current();
      if (currentUser) {
        setUsername(currentUser.getUsername());

        const friendsArray = currentUser.get('friends') || []; 
        console.log(friendsArray);
        setFriends(friendsArray); 
      }
    };
    fetchFriends();
  }, []);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        gestureEnabled: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <Ionicons name="menu" size={24} color="black" style={styles.drawerIconColor} />
          </TouchableOpacity>
        ),
      });

      return () => {
        navigation.setOptions({
          gestureEnabled: true,
          headerLeft: undefined,
        });
      };
    }, [navigation])
  );

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

  const handleCreateMeeting = async () => {
    if (midpoint && selectedFriend) {
      const currentUser = Parse.User.current();
      const coordinates = midpoint;
      const location = midpointAddress;

      await createMeeting(
        currentUser.id,
        selectedFriend.id,
        location,
        coordinates,
        time,
        date
      );

      Alert.alert('Meeting created successfully!');
    } else {
      Alert.alert('Error', 'Please find a meeting point and select a friend first.');
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
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.largeText}>Welcome, {username}!</Text>

        <View style={styles.midwayContainer}>
          <Text style={styles.midwayText}>Find Midway Point</Text>

          <GooglePlacesAutocomplete
            placeholder="Enter User Address"
            onPress={(data, details = null) => setSelectedUserAddress(details)}
            query={{
              key: 'AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc',
              language: 'en',
              components: 'country:us',
              types: 'address',
            }}
            fetchDetails={true}
            styles={autocompleteStyles}
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
            onPress={(data, details = null) => setSelectedFriendAddress(details)}
            query={{
              key: 'AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc',
              language: 'en',
              components: 'country:us',
              types: 'address',
            }}
            fetchDetails={true}
            styles={autocompleteStyles}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => {
                if (selectedFriendAddress) {
                  setFriendAddress(selectedFriendAddress);
                } else {
                  Alert.alert('Error', "Please select a friend's address.");
                }
              }}
            >
              <Text style={styles.bigButtonText}>Set Friend's Location</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Picker
              selectedValue={selectedFriend ? selectedFriend.id : null}
              onValueChange={(itemValue) => {
                console.log("Picker change event triggered. Selected friend ID:", itemValue);

                const selected = friends.find(friend => friend.id === itemValue);
                setSelectedFriend(selected);
                console.log("Selected friend object:", selected);
              }}
              style={localStyles.picker}
            >
              {friends.map((friend, index) => {
                console.log(friend);
                return <Picker.Item key={index} label={friend.get('username')} value={friend.id} />;
              })}
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.bigButton}
            onPress={findMeetingPoint}
          >
            <Text style={styles.bigButtonText}>Find Meeting Point</Text>
          </TouchableOpacity>

          {midpoint && (
            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => openGoogleMaps(midpoint.lat, midpoint.lng)}
            >
              <Text style={styles.bigButtonText}>Open in Google Maps</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.bigButton}
            onPress={() => {
              if (midpoint && selectedFriend) {
                const currentUser = Parse.User.current();
                console.log("CurrentUser " + currentUser);
                const coordinates = midpoint;
                console.log("Coordinates " + coordinates);
                const location = midpointAddress;
                console.log("Address " + midpointAddress);
                const user1Id = currentUser.id;
                console.log("User1 " + user1Id);
                const user2Id = selectedFriend.id;
                console.log(selectedFriend.name);
                console.log("User2 " + user2Id);

                createMeeting(user1Id, user2Id, location, coordinates, time, date)
                  .then(() => {
                    Alert.alert('Meeting created successfully!');
                  })
                  .catch((error) => {
                    console.error('Error creating meeting:', error);
                    Alert.alert('Error', 'Failed to create meeting. Please try again.');
                  });
              } else {
                Alert.alert('Error', 'Please select a friend and find the midpoint first.');
              }
            }}
          >
            <Text style={styles.bigButtonText}>Create Meeting</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Map userAddress={userAddress} friendAddress={friendAddress} midpoint={midpoint} />
          </View>

        </View>
      </View>
    </ScrollView>
  );
};

const autocompleteStyles = {
  container: {
    flex: 0,
    width: '100%',
    marginTop: 10,
  },
  textInputContainer: {
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  listView: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
};

const localStyles = StyleSheet.create({
  picker: {
    height: 50,  
    width: '100%',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

export default DashboardScreen;
