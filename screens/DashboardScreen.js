//This will be the original dashboard where users find midway points based on preferences
//Will try to maintain original dashboard 
import React, { useEffect, useState, useCallback, useContext} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Parse from 'parse/react-native.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Map from './Map'; 
import { determineGlobalStyles } from '../components/Styles';
import { createMeeting, openGoogleMaps } from '../models/Meeting'; 
import { AuthContext } from '../context/AuthContext';
import * as Animatable from 'react-native-animatable';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
// import ProgressBarAnimation from '../components/ProgressBarAnimation'

const DashboardScreen = () => {
  const {darkMode} = useContext(AuthContext)
  //Determine the styling for the dashboard 
  let { styles } = determineGlobalStyles(darkMode);
  //Set the username 
  const [username, setUsername] = useState('');
  //Set the user1 address 
  const [selectedUserAddress, setSelectedUserAddress] = useState('');
  //Set the selected connection address
  const [selectedFriendAddress, setSelectedFriendAddress] = useState('');
  //User address used for calculations 
  const [userAddress, setUserAddress] = useState('');
  //Friend address used for calculations 
  const [friendAddress, setFriendAddress] = useState('');
  //Variable to hold the midpoint for calculation 
  const [midpoint, setMidPoint] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  //Empty array to display friends if there are no friends 
  const [friends, setFriends] = useState([]);
  //Set the midpoint address for the meeting object 
  const [midpointAddress, setMidpointAddress] = useState('');

    //Method to set the time for the meeting object
    const formatCurrentTime = (date) => {
      //Define the hours 
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let dayOrNight = hours >= 12 ? 'PM' : 'AM';
  
      //Convert to 12 hour format 
      hours = hours % 12
      //Incase hours is equal to 0 then set it to 12 or mid day 
      hours = hours ? hours : 12 ;
      //Add a zero if needed 
      let formattedTime = minutes  < 10 ? `0${minutes}` : minutes; 
  
      return `${hours}:${formattedTime} ${dayOrNight}`;
    };
  //Current time 
  const [time, setTime] = useState(formatCurrentTime(new Date()));
  //Current date 
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  

    // Handle the date change
    const handleDateChange = (event, selected) => {
      setShowDatePicker(Platform.OS === 'ios'); // Keep it open for iOS
      if (selected) {
        const currentDate = new Date();
        if (selected >= currentDate) {
          setDate(selected); // Only set future dates and current date/time
        } else {
          Alert.alert('Invalid Date', 'Please select a current or future date and time.');
        }
      }
    };

  const navigation = useNavigation();

  //New states to handle new flow
const [currentAction, setCurrentAction] = useState(null);
const [currentStep, setCurrentStep] = useState(1);
const [totalSteps, setTotalSteps] = useState(3);

//Loading state for retrieving current location
const [loading, setLoading] = useState(false);
const [loadingFriends, setLoadingFriends] = useState(true);
//Effect to set the notifications token
useEffect(() => {
  registerForPushNotificationsAsync().then(token => {
    // Save the token for later use if needed
    // console.log('Push token:', token);
  });

  const subscription = Notifications.addNotificationReceivedListener(notification => {
    Alert.alert('Notification Received', notification.request.content.body);
  });

  return () => subscription.remove();
}, []);


// Effect to retrieve friends with retry mechanism
useEffect(() => {
  const fetchFriends = async () => {
    setLoadingFriends(true); // Start loading friends
    try {
      const currentUser = Parse.User.current();
      if (currentUser) {
        setUsername(currentUser.getUsername());
        const friendsArray = currentUser.get('friends') || [];
        // const friendsArray = currentUser.get('friends') || currentUser.get('friendsList') || [];

        // console.log(friendsArray)

        // Fetch details for each friend in parallel with retry logic
        const friendPromises = friendsArray.map(async (friendPointer, index) => {
          try {
            let friend = await friendPointer.fetch();
            
            // Check if data is complete; retry if necessary
            if (!friend.get('username') || !friend.get('email')) {
              // console.log(`Retrying fetch for friend ${index + 1} due to missing data...`);
              const userQuery = new Parse.Query(Parse.User);
              friend = await userQuery.get(friend.id);
            }
            
            // Return fetched friend details
            return {
              id: friend.id,
              username: friend.get('username'),
              // email: friend.get('email'), // Include email if needed
            };
          } catch (error) {
            console.error(`Error fetching or re-fetching friend ${index + 1}:`, error);
            return null; // Return null for failed fetches to avoid breaking Promise.all
          }
        });

        // Resolve all promises and filter out any null values
        const fetchedFriends = (await Promise.all(friendPromises)).filter(Boolean);

        setFriends(fetchedFriends); // Set the fully fetched friend details
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to fetch friends. Please try again later.');
    } finally {
      setLoadingFriends(false); // End loading friends
    }
  };

  fetchFriends();
}, []);

//Helper function for notifications
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }
    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas?.projectId })).data;
    } catch (error) {
      Alert.alert('Error getting push token', error.message);
    }
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  return token;
}

//Helper function to have access to the side menu
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

//Helper function to obtain the address based on the given or chosen address 
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

  //Method to create the meeting object that will be sent out 
 
const handleCreateMeeting = async () => {
  if (midpoint && selectedFriend) {
    const currentUser = Parse.User.current();
    const coordinates = midpoint;
    const location = midpointAddress;
    const user1Id = currentUser.id;
    const user2Id = selectedFriend.id;

    try {
      // Call createMeeting with necessary parameters
      await createMeeting(user1Id, user2Id, location, coordinates, time, date);
      // Alert.alert('Meeting created successfully!');

      // Schedule a push notification after creating the meeting
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "New Meeting Created!",
          body: `You have successfully created a meeting with ${selectedFriend.username} at ${location}.`,
        },
        trigger: { seconds: 1 }, // Trigger after 1 second
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      Alert.alert('Error', 'Failed to create meeting. Please try again.');
    }
  } else {
    Alert.alert('Error', 'Please select a friend and find the midpoint first.');
  }
};
//Method to find the meeting or halfway point between the two points 
  const findMeetingPoint = async () => {
    if (userAddress && friendAddress) {
      const userLocation = userAddress.geometry.location;
      const friendLocation = friendAddress.geometry.location;
      const midpointCoordinates = calculateMidpoint(userLocation, friendLocation);
      setMidPoint(midpointCoordinates);

      const address = await reverseGeocodeMidpoint(midpointCoordinates.lat, midpointCoordinates.lng);
      setMidpointAddress(address);

 
      Alert.alert('Midpoint Details', `Coordinates: ${midpointCoordinates.lat}, ${midpointCoordinates.lng}\nAddress: ${address}`);
    } else {
      Alert.alert('Error', 'Please set both user and friend locations.');
    }
  };


  //Creating the progress tracker functions
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepsForUser = () => {
    if (currentStep === 1 && selectedUserAddress) {
      setUserAddress(selectedUserAddress);
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedFriendAddress) {
      setFriendAddress(selectedFriendAddress);
      setCurrentStep(3);
    } else if (currentAction === 'createMeeting' && currentStep === 3 && midpoint) {
      // Move to Step 4 for selecting a friend
      setCurrentStep(4);
    } else if (currentAction === 'createMeeting' && currentStep === 4 && selectedFriend) {
      // Move to Step 5 for setting the meeting time and date
      setCurrentStep(5);
    }
  };

  //Handle the start of the flow for the user 
  const initialFlow = (selectedFlow) => {
    setCurrentAction(selectedFlow);
    setCurrentStep(1);
    if (selectedFlow === 'findMidPoint') {
      setTotalSteps(3);
    } else if (selectedFlow === 'createMeeting') {
      setTotalSteps(5);
    }
  }

  //Helper functon to handle next step in the sequence
  const handleNextStep = () => {
    if(currentStep < totalSteps){
      setCurrentStep(currentStep + 1);
    }
  }
  //To set the new progress tracker if they choose to create a meeting
  const switchToMeeting = () => {
    if (currentAction === 'findMidPoint'){
      setCurrentAction('createMeeting');
      setTotalSteps(5);
    }
  }


  //Progress dot object
  const ProgressDots = ({ currentStep}) => {
// Guard clause to ensure totalSteps is a valid positive number
  // if (!totalSteps || totalSteps <= 0) {
  //   return null; // Return nothing or a fallback if totalSteps is invalid
  // }
    return (
      <View style={progressStyling.progressContainer}>
        <View style={progressStyling.progressBarContainer}>
        {[...Array(totalSteps - 1)].map((_, index) => (
            <View
              key={index}
              style={[
                progressStyling.progressBarSegment,
                currentStep > index + 1 ? progressStyling.progressBarFill : progressStyling.progressBarEmpty,
              ]}
            />
          ))}
        </View>
        {[...Array(totalSteps)].map((_, index) => (
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

  //Component to handle midpoint calculation
  const MidPointFinder = ({
  currentStep,
  setSelectedUserAddress,
  setUserAddress,
  setSelectedFriendAddress,
  userAddress,
  friendAddress,
  findMeetingPoint,
  openGoogleMaps,
  midpoint,
  loading,
  setLoading
  }) => {
    return (
      <>
      {/* Step 1 for user address  */}
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
   
    Alert.alert('Permission denied', 'We need your permission to access location.');
        return; 
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

    setLoading(false);
 }
 }}
    disabled={loading}
>
<Text style={styles.bigButtonText}>Use Current Location</Text>
</TouchableOpacity>

{loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 10 }} />}
       {/* Current Step view closer */}
        </View>
      )}

      {/* Step 2 for second user address*/}
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
      {/* Step 3 Finding Midpoint */}
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
                 {/* <Text style={styles.screenText}>Then Open Maps</Text> */}
                 <TouchableOpacity
                 style={styles.bigButton}
                 onPress={() => openGoogleMaps(midpoint.lat, midpoint.lng)}
           >
             <Text style={styles.bigButtonText}>Open in Google Maps</Text>
           </TouchableOpacity>
                 </View>
      )}
      </>
    )
  }


  return (
    <View style={styles.container}>
      {!currentAction && (
          <View style = {localStyles.tempContainer}>
          <Text style={styles.largeText}>Welcome, {username}!</Text>
          <Text style = {styles.largeText}> What you like to do today?</Text>
          <TouchableOpacity style={styles.bigButton} onPress={() => initialFlow('findMidPoint')}>
            <Text style={styles.bigButtonText}>Find Midpoint</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bigButton} onPress={() => initialFlow('createMeeting')}>
            <Text style={styles.bigButtonText}>Create Meeting</Text>
          </TouchableOpacity>
           </View>
      )}

    
     
      {currentAction && (
         <View style = {localStyles.tempContainer}> 
          {/* Here is the placeholder for the progress bar  */}
          <ProgressDots currentStep={currentStep}/>
          {/* If mid point is chosen we enter here for mid point flow */}
          <Animatable.View
        key={currentStep}
        animation={currentStep > 1 ? "slideInRight" : "slideInLeft"}
        duration={500}
        style={{ width: '100%', alignItems: 'center' }}
      >

      {currentAction === 'findMidPoint' || currentAction === 'createMeeting' ? (
          <MidPointFinder
            currentStep={currentStep}
            setSelectedUserAddress={setSelectedUserAddress}
            setUserAddress={setUserAddress}
            setSelectedFriendAddress={setSelectedFriendAddress}
            userAddress={userAddress}
            friendAddress={friendAddress}
            findMeetingPoint={findMeetingPoint}
            openGoogleMaps={openGoogleMaps}
            midpoint={midpoint}
            loading={loading}
            setLoading={setLoading}
          />
        ) : null}
         

          {/* Step 4 for Meeting Creation */}
          {currentAction === 'createMeeting' && currentStep === 4 && (
           <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, width: '100%' }}>
           {loadingFriends ? (
             <ActivityIndicator size="large" color="#007bff" />
           ) : (
             <>
               {friends.length > 0 ? (
                 <>
                   <Text style={styles.screenText}>Select a Friend to Meet With:</Text>
                   <Picker
                  selectedValue={selectedFriend ? selectedFriend.id : null}
                  onValueChange={(itemValue) => {
                  const selected = friends.find(friend => friend.id === itemValue);
                  setSelectedFriend(selected);
                  }}
                style={localStyles.picker}
                  >
            {friends.map((friend, index) => (
      <Picker.Item key={index} label={friend.username} value={friend.id} />
  ))}
</Picker>
                 </>
               ) : (
                 <Text style={styles.screenText}>No friends found. Please add friends.</Text>
               )}
             </>
           )}
         </View>
          )}

          {currentAction === 'createMeeting' && currentStep === 5 && (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, width: '100%' }}>
            <Text style={styles.screenText}>Select Time and Date:</Text>
        
            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.bigButtonText}>
                {date
                  ? `Selected: ${date.toLocaleString()}`
                  : 'Select Date and Time'}
              </Text>
            </TouchableOpacity>
            
            {/* We have simplified the create meeting button */}
            <TouchableOpacity
            style={styles.bigButton}
            onPress={handleCreateMeeting}
            >
             <Text style={styles.bigButtonText}>Create Meeting</Text>
            </TouchableOpacity>
        
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime" // Allow both date and time selection
                display="default"
                minimumDate={new Date()} // Restrict past dates and times
                onChange={handleDateChange}
              />
            )}
          </View>
             )}
           </Animatable.View>

           {/* Next and previous section */}
           <View style={progressStyling.buttonContainer}>
              <TouchableOpacity style={[progressStyling.button, currentStep === 1 && styles.disabledButton]}
               onPress={() => setCurrentStep((previousStep) => Math.max(previousStep - 1, 1))}
              disabled={currentStep == 1}>
              <Text style ={progressStyling.buttonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity   style={[
                progressStyling.button,
              (currentStep === 1 && !selectedUserAddress) || (currentStep === 2 && !selectedFriendAddress) || 
              (currentAction === 'createMeeting' && currentStep === 3 && !midpoint) ||
              (currentAction === 'createMeeting' && currentStep === 4 && !selectedFriend)
               ? progressStyling.disabledButton
               : progressStyling.bigButton,
                 ]}
                 onPress={stepsForUser}
                disabled={
              (currentStep === 1 && !selectedUserAddress) ||
              (currentStep === 2 && !selectedFriendAddress) ||  
              (currentAction === 'createMeeting' && currentStep === 3 && !midpoint) ||
              (currentAction === 'createMeeting' && currentStep === 4 && !selectedFriend)
              }>
              <Text style={progressStyling.buttonText}>Next</Text>
              </TouchableOpacity>
              {/* Next and Previous button view closer  */}
              </View>

        {/* Choice view closer  */}
         </View>
      )}
              {/* Map Object Section*/}
              {(currentStep <= 3) && (
              <View style={{ flex: 1, width: '100%' }}>
              <Map userAddress={userAddress} friendAddress={friendAddress} midpoint={midpoint} />
                 {/* Map View closer */}
              </View>
              )}

    {/* Container View */}
    </View>

  );
};


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
    // width: '100%'
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
    // width: '100%',
    flex: 1,
    height: 4,
    borderRadius: 2,
    borderColor: 'red',
  },
  progressBarFill: {
    backgroundColor: 'green',
  }, progressBarEmpty: {
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
    marginBottom: 15,  },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: 'grey',
    },
  },
  );

const autocompleteStyles = {
  container: {
    flex: 0,
    width: '100%',
    marginBottom: 10,
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
  // height: 50,  
  width: '100%', 
  backgroundColor: 'white',
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 8,
  marginVertical: 10,
  color: '#000',
  },
  tempContainer:{
   flex: 0,
   alignItems: 'center', 
   justifyContent: 'center', 
   width: '100%', 
  //  marginTop: 20 
  },
});
export default DashboardScreen;

{/* <TouchableOpacity
style={styles.bigButton}
onPress={() => {
  if (selectedUserAddress) {
    setUserAddress(selectedUserAddress);
    handleNextStep();
  } else {
    Alert.alert('Error', 'Please select a user address.');
  }
}}
>
<Text style={styles.bigButtonText}>Set User Location</Text>
</TouchableOpacity> */}

     {/* Or use current location section */}

     {/* Switch to creating meeting */}
              {/* <TouchableOpacity
                style={styles.bigButton}
                onPress={handleSwitchToMeeting}
              >
                <Text style={styles.bigButtonText}>Switch to Create Meeting Flow</Text>
              </TouchableOpacity> */}
              {/* Container view component */}


        {/* Open google maps section */}
          {/* {midpoint && (
          <TouchableOpacity
          style={styles.bigButton}
            onPress={() => openGoogleMaps(midpoint.lat, midpoint.lng)}
              >
                <Text style={styles.bigButtonText}>Open in Google Maps</Text>
              </TouchableOpacity>
              )} */}

            {/* Find meeting point section */}
            {/* <TouchableOpacity
          style={styles.bigButton}
          onPress={findMeetingPoint}
        >
          <Text style={styles.bigButtonText}>Find Meeting Point</Text>
        </TouchableOpacity> */}

 
          {/* <Text style = {styles.largeText}> PlaceHolder for progressbar</Text> */}
          {/* <Text > Step {currentStep} of {totalSteps}</Text> */}

//Component to obtain second user address
        {/* Friend address section */}
                
        {/* <GooglePlacesAutocomplete
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
                handleNextStep();
              } else {
                Alert.alert('Error', 'Please select a friend\'s address.');
              }
            }}
          >
            <Text style={styles.bigButtonText}>Set Friend's Location</Text>
          </TouchableOpacity>
        </View> */}


// Method to create meeting object
{/* <TouchableOpacity
style={styles.bigButton}
onPress={() => {
  // console.log(midpoint)
// console.log(selectedFriend)
if (midpoint && selectedFriend) {
 const currentUser = Parse.User.current();
  // console.log("CurrentUser " + currentUser)
const coordinates = midpoint;
// console.log("Coordinates " + coordinates)
const location = midpointAddress;
// console.log("Address " + midpointAddress)
const user1Id = currentUser.id;
// console.log("User1 " + user1Id)
const user2Id = selectedFriend.id;
// console.log(selectedFriend.name)
// console.log("User2 " + user2Id)

// Call createMeeting with necessary parameters
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
</TouchableOpacity> */}



//Friend Picker 
   {/* <View style={{ flex: 1 }}>
        <Picker
        selectedValue={selectedFriend ? selectedFriend.id : null}  // Set selectedValue to the friend's ID
       onValueChange={(itemValue) => {
       // console.log("Picker change event triggered. Selected friend ID:", itemValue);  // Log selected friend ID

        // Find the selected friend object based on the selected ID
        const selected = friends.find(friend => friend.id === itemValue);
        setSelectedFriend(selected);  // Set the full selected friend object in state
        // console.log("Selected friend object:", selected);  // Log the full selected friend object
         }}
          style={localStyles.picker}
          >
          {friends.map((friend, index) => {
         // console.log(friend);  // Log each friend object to inspect structure
          return <Picker.Item key={index} label={friend.get('username')} value={friend.id} />;  // Use friend.id as the value
        })}
        </Picker>
        </View> */}

            {/* <TouchableOpacity
            style={styles.bigButton}
            onPress={() => {
            // console.log(midpoint)
            // console.log(selectedFriend)
            if (midpoint && selectedFriend) {
            const currentUser = Parse.User.current();
            // console.log("CurrentUser " + currentUser)
            const coordinates = midpoint;
            // console.log("Coordinates " + coordinates)
            const location = midpointAddress;
            // console.log("Address " + midpointAddress)
            const user1Id = currentUser.id;
            // console.log("User1 " + user1Id)
            const user2Id = selectedFriend.id;
            // console.log(selectedFriend.name)
            // console.log("User2 " + user2Id)

          // Call createMeeting with necessary parameters
          createMeeting(user1Id, user2Id, location, coordinates, time, date)
          .then(() => {
          Alert.alert('Meeting created successfully!');
    //  // Schedule a push notification after creating the meeting
    //  await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: "New Meeting Created!",
    //     body: `You have successfully created a meeting with ${selectedFriend.username} at ${location}.`,
    //   },
    //   trigger: { seconds: 1 }, // Trigger after 1 second
    // });
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
          </TouchableOpacity> */}