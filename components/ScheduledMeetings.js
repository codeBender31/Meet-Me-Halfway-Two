//This modal will display any meeting objects that have been stored in the database and already sent out through sms
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Modal, TouchableOpacity, Button, Linking, Image, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import Parse from 'parse/react-native.js';
import { AuthContext } from '../context/AuthContext';
import { determineGlobalStyles } from './Styles';

const ScheduledMeetings = () => {
const {darkMode} = useContext(AuthContext)
const {styles} = determineGlobalStyles(darkMode)
const APIkey= 'AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc'

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  //Pull to refresh state control
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => console.error('Error opening Google Maps:', err));
  };

  const openNearbySafePlacesModal = async (latitude, longitude) => {
    setModalVisible(true);
    setCurrentLocation({ latitude, longitude });

    // Fetch nearby safe places using Google Places API
    // const apiKey = 'AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc';
    //This dictates how far out the radius goes
    const radius = 10000; 
    const type = 'restaurant|police|shopping_mall|library|park|museum'; 
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${APIkey}`
      );
      const data = await response.json();

      const places = data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 'N/A',
        totalRatings: place.user_ratings_total || 0,
        openNow: place.opening_hours ? place.opening_hours.open_now : 'N/A',
        types: place.types || [],
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        photoReference: place.photos ? place.photos[0].photo_reference : null
      }));

      // setNearbyPlaces(data.results);
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  //Helper function to retrieve photos
  const getPhotoUrl = (photoReference, APIkey) => {
    if (!photoReference) {
      return null; // No photo available
    }
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${APIkey}`;
  };
  //Function to help when refresh has been set
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchMeetings();
    }, 1000); 
  };  

  const fetchMeetings = async () => {
    const currentUser = Parse.User.current();
    // setLoading(true);
    if (!currentUser) {
      return; // User is not logged in
    }

    try {
      // Query where user1 is the current user
      const query1 = new Parse.Query('Meeting');
      query1.equalTo('user1', currentUser);
      query1.include('user1'); 
      query1.include('user2');

      // Query where user2 is the current user
      const query2 = new Parse.Query('Meeting');
      query2.equalTo('user2', currentUser);
      query2.include('user1'); 
      query2.include('user2');

      // Combine the two queries with the OR operator
      const mainQuery = Parse.Query.or(query1, query2);
      const results = await mainQuery.find();

      // console.log('Meetings JSON:', results.map((meeting) => meeting.toJSON()));
    // Check if users are properly fetched and re-fetch if necessary
    for (let i = 0; i < results.length; i++) {
      const meeting = results[i];
      let user1 = meeting.get('user1');
      let user2 = meeting.get('user2');

      if (!user1 || typeof user1.get('username') === 'undefined') {
        try {
          const user1Query = new Parse.Query(Parse.User);
          user1 = await user1Query.get(meeting.get('user1').id);
          meeting.set('user1', user1);
        } catch (error) {
          console.error(`Error re-fetching user1 for Meeting ${i + 1}:`, error);
        }
      }

      if (!user2 || typeof user2.get('username') === 'undefined') {
        try {
          const user2Query = new Parse.Query(Parse.User);
          user2 = await user2Query.get(meeting.get('user2').id);
          meeting.set('user2', user2);
        } catch (error) {
          console.error(`Error re-fetching user2 for Meeting ${i + 1}:`, error);
        }
      }
    }

    // Log the usernames after trying to re-fetch
    const usernames = results.map((meeting, index) => {
      const user1 = meeting.get('user1');
      const user2 = meeting.get('user2');

      // console.log(`Meeting ${index + 1} - User1 ID: ${user1 ? user1.id : 'undefined'}, Username: ${user1 ? user1.get('username') : 'undefined'}`);
      // console.log(`Meeting ${index + 1} - User2 ID: ${user2 ? user2.id : 'undefined'}, Username: ${user2 ? user2.get('username') : 'undefined'}`);

      return {
        user1: user1 ? user1.get('username') : 'N/A',
        user2: user2 ? user2.get('username') : 'N/A',
      };
    });

    // console.log('Usernames in Meetings:', usernames);

      setMeetings(results);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  

  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color = {styles.activityIndicatorColor} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.largeText}>Scheduled Meetings</Text>
      {meetings.length > 0 ? (
        <FlatList
          data={meetings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const user1 = item.get('user1');
            const user2 = item.get('user2');
            const location = item.get('location');
            const coordinates = item.get('coordinates');
            const date = new Date(item.get('date')).toLocaleDateString();
            const time = item.get('time');

            // Determine the other user
            const otherUser = user1.id === Parse.User.current().id ? user2 : user1;

            return (
              <View style={styles.meetingItem}>
                <Text style={styles.meetingText}>Meeting with: {otherUser.get('username')}</Text>
                <Text style={styles.meetingText}>Location: {location}</Text>
                <Text style={styles.meetingText}>Date: {date}</Text>
                <Text style={styles.meetingText}>Time: {time}</Text>
                {coordinates && (
                <>
                {/* <Button
                      title="Open in Google Maps"
                      onPress={() => openGoogleMaps(coordinates.latitude, coordinates.longitude)}
                    /> */}
                     <TouchableOpacity
                      style={styles.bigButton}
                      onPress={() => openGoogleMaps(coordinates.latitude, coordinates.longitude)}
                      >
                    <Text style={styles.bigButtonText}>Open in Google Maps</Text>
                    </TouchableOpacity>
                    {/* <Button
                      title="Nearby Safe Places"
                      onPress={() => openNearbySafePlacesModal(coordinates.latitude, coordinates.longitude)}
                    /> */}
                      <TouchableOpacity
                      style={styles.bigButton}
                      onPress={() => openNearbySafePlacesModal(coordinates.latitude, coordinates.longitude)}
                      >
                    <Text style={styles.bigButtonText}>Nearby Safe Places</Text>
    </TouchableOpacity>
                </>
                )}
              </View>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <Text>No scheduled meetings found.</Text>
      )}
<Modal visible={modalVisible} animationType="slide">
  {/* <View style={localStyles.modalContainer}> */}
  <SafeAreaView style={localStyles.modalContainer}>
  {/* <ScrollView contentContainerStyle={localStyles.modalContent}> */}
    {/* <TouchableOpacity onPress={() => setModalVisible(false)}>
      <Text style={localStyles.closeButton}>Close</Text>
    </TouchableOpacity> */}
    <Text style={styles.largeText}>Nearby Safe Places</Text>
    {nearbyPlaces.length > 0 ? (
      <FlatList
        data={nearbyPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
         
          const photoUrl = getPhotoUrl(item.photoReference, APIkey);
          // console.log('Photo Reference:', item.photoReference);
          // console.log('Photo URL:', photoUrl);
        
          return (
            <View style={localStyles.placeItem}>
              <Text style={localStyles.placeName}>{item.name}</Text>
              <Text style={localStyles.placeAddress}>{item.vicinity}</Text>
              <Text style={localStyles.placeRating}>Rating: {item.rating} ({item.totalRatings} reviews)</Text>
              <Text style={localStyles.placeOpenNow}>
                {item.openNow !== 'N/A' ? (item.openNow ? 'Open Now' : 'Closed Now') : 'Opening hours not available'}
              </Text>
              {photoUrl && (
                <Image
                  source={{ uri: photoUrl }}
                  style={localStyles.placePhoto}
                />
              )}
                <TouchableOpacity
                style={styles.bigButton}
                onPress={() => openGoogleMaps(item.coordinates.lat, item.coordinates.lng)}
                >
      <Text style={styles.bigButtonText}>Open in Google Maps</Text>
    </TouchableOpacity>
              {/* <Button
                title="Open in Google Maps"
                onPress={() => openGoogleMaps(item.coordinates.lat, item.coordinates.lng)}
              /> */}
            </View>
          );
        }}
      />
    ) : (
      <Text>No nearby safe places found.</Text>
    )}
     {/* </ScrollView> */}
     {/* <Button title="Close" onPress={() => setModalVisible(false)} /> */}
     <TouchableOpacity style={styles.bigButton} onPress={() => setModalVisible(false)}>
  <Text style={styles.bigButtonText}>Close</Text>
</TouchableOpacity>
  {/* </View> */}
  </SafeAreaView>
</Modal>

    </View>
  );
};

export default ScheduledMeetings;

const localStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  closeButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 18,
    color: 'blue',
  },
  placePhoto:{
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  placeItem: {
    backgroundColor: '#f9f9f9', 
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  placeAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  placeRating: {
    fontSize: 14,
    color: '#888',
  },
  placeOpenNow: {
    fontSize: 14,
    color: '#007700',
    fontWeight: '600',
    marginBottom: 5,
  },
  placePhoto: {
    width: '100%', 
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
    marginVertical: 10,
  },
})