//A screen for users to try out our product before they sign up
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Map from './Map';
import { determineGlobalStyles } from '../components/Styles'; 
import * as Animatable from 'react-native-animatable';
import * as Location from 'expo-location';

const MidwayGuest = () => {
  const { styles } = determineGlobalStyles();  
  //Set current state to keep track of flow
  const [currentStep, setCurrentStep] = useState(1);
  //State for user and friend's address
  const [selectedUserAddress, setSelectedUserAddress] = useState('');
  const [selectedFriendAddress, setSelectedFriendAddress] = useState('');
  //State to hold user and friends address 
  const [userAddress, setUserAddress] = useState('');
  const [friendAddress, setFriendAddress] = useState('');
  //States for midpoint
  const [midpoint, setMidpoint] = useState(null);
  const [midpointAddress, setMidpointAddress] = useState('');
//To let the user know we are fetching their location
  const [loading, setLoading] = useState(false);


  //Method to calculate midpoint 
  const calculateMidpoint = (location1, location2) => {
    const lat = (location1.lat + location2.lat) / 2;
    const lng = (location1.lng + location2.lng) / 2;
    return { lat, lng };
  };

 //Method to pin the longitude and lattitude in the map
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
  //Helper method to obtain user's address

//Method to find meeting between the two addresses
  const findMeetingPoint = async () => {
    if (userAddress && friendAddress) {
      const userLocation = userAddress.geometry.location;
      const friendLocation = friendAddress.geometry.location;
      const midpointCoordinates = calculateMidpoint(userLocation, friendLocation);
      setMidpoint(midpointCoordinates);

     //Usual to hold the address for the midpoint coordinates 
     const address = await reverseGeocodeMidpoint(midpointCoordinates.lat, midpointCoordinates.lng);
      setMidpointAddress(address);

      // Alert.alert('Midpoint Details', `Coordinates: ${midpointCoordinates.lat}, ${midpointCoordinates.lng}\nAddress: ${address}`);
      Alert.alert('Looks like you’ve found the perfect spot! Sign up now to save your meeting points and unlock more features.');
    } else {
      Alert.alert('Error', 'Please set both user and friend locations.');
    }
  };

  const ProgressDots = ({ currentStep }) => {
    return (
      <View style={progressStyling.progressContainer}>
        <View style={progressStyling.progressBarContainer}>
          {[...Array(2)].map((_, index) => (
            <View
              key={index}
              style={[
                progressStyling.progressBarSegment,
                currentStep > index + 1 ? progressStyling.progressBarFill : progressStyling.progressBarEmpty,
              ]}
            />
          ))}
        </View>
        {[...Array(3)].map((_, index) => (
          <View
            key={index}
            style={[
              progressStyling.dot,
              currentStep > index ? progressStyling.activeDot : progressStyling.inactiveDot,
            ]}
          >
            <Text style={currentStep > index ? progressStyling.activeDotText : progressStyling.inactiveDotText}>
              {index + 1}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  //Helper method to manage steps in the dashboard
  const stepsForUser = () => {
    if (currentStep === 1 && selectedUserAddress){
      setUserAddress(selectedUserAddress);
      setCurrentStep(2);
    } else if(currentStep === 2 && selectedFriendAddress){
      setFriendAddress(selectedFriendAddress);
      setCurrentStep(3);
    }
  }
  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  return (
    //Render all components
    <View style={styles.container}>
      {/* <Text style={styles.screenText}>Find A Mid Point</Text> */}

      <ProgressDots currentStep={currentStep} />


      <Animatable.View
  key={currentStep} 
  animation={currentStep > 1 ? "slideInRight" : "slideInLeft"} 
  duration={500} 
  style={{ width: '100%', alignItems: 'center' }} 
>
{currentStep === 1 && (
  <View style = {{ flex: 0, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}> 
    <Text style={styles.screenText}> Please provide your current address.</Text>

   
    <GooglePlacesAutocomplete
      placeholder="Enter Your Address"
      onPress={(data, details = null) => {
        setSelectedUserAddress(details); 
        setUserAddress(details);
      }}
      query={{
        key: 'AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc',
        language: 'en',
        // components: 'country:us',
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

    <Text style={styles.screenText}>Or</Text>

    <TouchableOpacity
  style={[styles.bigButton, styles.useCurrentLocationButton]}
  onPress={async () => {
    try {
   
      let { status } = await Location.requestForegroundPermissionsAsync();
      
    
      if (status !== 'granted') {
        // If permission is denied, show an alert and do nothing further
        Alert.alert('Permission denied', 'We need your permission to access location.');
        return; // Exit the function here
      }

      setLoading(true);

    
      let location = await Location.getCurrentPositionAsync({});
      
     
      if (location) {
        const { latitude, longitude } = location.coords;

        const details = {
          formatted_address: 'Current Location',
          geometry: {
            location: { lat: latitude, lng: longitude }
          }
        };
        
   
        setSelectedUserAddress(details);
        setUserAddress(details);
        // Alert.alert('Location set', `Your current location has been set.\nLatitude: ${details.geometry.location.lat}, Longitude: ${details.geometry.location.lng}`);

      }
    } catch (error) {
      
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'Could not fetch location. Please try again.');
    } finally {
      // Step 8: Stop loading regardless of success or error
      setLoading(false);
    }
  }}
  disabled={loading} // Disable button when loading
>
  <Text style={styles.bigButtonText}>Use Current Location</Text>
</TouchableOpacity>

{loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 10 }} />}

  </View>
)}
  
    {currentStep === 2 && (
      <View>
        <Text style = {styles.screenText}>Please provide the second location.</Text>
      <GooglePlacesAutocomplete
        placeholder="Enter Your Friend's Address"
        onPress={(data, details = null) => {
          setSelectedFriendAddress(details); 
        }}
        query={{
          key: 'AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc',
          language: 'en',
          // components: 'country:us',
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
      </View>
    )}
    
    {currentStep === 3 && (
      <View style={{ flex: 0, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
      <Text style={styles.screenText}> Press the button below to find the meeting point.</Text>
           <TouchableOpacity
           style={[styles.bigButton, !(userAddress && friendAddress) && styles.disabledButton]}
           onPress={findMeetingPoint}
           disabled={!(userAddress && friendAddress)}
         >
           <Text style={!(userAddress && friendAddress) ? styles.disabledButtonText : styles.bigButtonText}>Find Meeting Point</Text>
         </TouchableOpacity>
         </View>
    )}
    </Animatable.View>
 <View style={progressStyling.buttonContainer}>
  <TouchableOpacity style={[progressStyling.button, currentStep === 1 && styles.disabledButton]}
  onPress={() => setCurrentStep((previousStep) => Math.max(previousStep - 1, 1))}
  disabled={currentStep == 1}>
    <Text style ={progressStyling.buttonText}>Previous</Text>
  </TouchableOpacity>

<TouchableOpacity   style={[
            progressStyling.button,
            (currentStep === 1 && !selectedUserAddress) || (currentStep === 2 && !selectedFriendAddress) || currentStep === 3
              ? progressStyling.disabledButton
              : progressStyling.bigButton,
          ]}
          onPress={stepsForUser}
          disabled={
            (currentStep === 1 && !selectedUserAddress) ||
            (currentStep === 2 && !selectedFriendAddress) || currentStep === 3
          }
        >
          <Text style={progressStyling.buttonText}>Next</Text>

</TouchableOpacity>
 </View>
      <Map userAddress={userAddress} friendAddress={friendAddress} midpoint={midpoint} />
      {/* <Map userLocation={userAddress?.geometry?.location} friendAddress={friendAddress} midpoint={midpoint} /> */}

    </View>
  );
};

export default MidwayGuest;

//Local Styling for progress bar indicator
const progressStyling = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  progressBarContainer: {
    position: 'absolute',
    top: '50%',
    left: 40,
    right: 40,
    height: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarSegment: {
    width: '40%',
    height: 4,
    borderRadius: 2,
  },
  progressBarFill: {
    backgroundColor: 'green',
  },
  progressBarEmpty: {
    backgroundColor: 'gray',
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    zIndex: 1,
  },
  activeDot: {
    backgroundColor: 'green',
  },
  inactiveDot: {
    backgroundColor: 'grey',
  },
  activeDotText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactiveDotText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'grey',
  },
},
);
