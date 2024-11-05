//This will serve as the notifications modal accessible from the side menu
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { determineGlobalStyles } from '../components/Styles'; 
//Import the backend components from Connection
import { getPendingRequests, handleFriendRequest } from '../models/Connection'; 
import { getUpcomingMeetings } from '../models/Meeting';
import { AuthContext } from '../context/AuthContext';
import Parse from 'parse/react-native.js';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const NotificationsModal = () => {
const {darkMode} = useContext(AuthContext)
  //Inherit styling from Styles.js
  let { styles } = determineGlobalStyles(darkMode);
  //Show the connection requests from the backend
  const [showConnectionRequests, setShowConnectionRequests] = useState(true);
  //This was the place holder variable name, will delete and convert to showConnectionRequests once debugging is complete
  const [connectionRequests, setConnectionRequests] = useState([]);
  const currentUser = Parse.User.current();
  //Fake meeting requests that serve as placeholders 
  const [meetRequests, setMeetRequests] = useState([
    { id: '1', name: 'Emily Davis', time: '3:00 PM' },
    { id: '2', name: 'Michael Scott', time: '5:30 PM' },
  ]);

  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState(null);
 // Fetch connection requests when component mounts (or login completes)
 useEffect(() => {
  fetchConnectionRequests();
  const intervalId = setInterval(fetchConnectionRequests, 10000); // Check every 10 seconds
  return () => clearInterval(intervalId);
}, []);

// useEffect(() => {
//   registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
// }, []);

useEffect(() => {
  const registerToken = async () => {
    const token = await registerForPushNotificationsAsync();
    setExpoPushToken(token);
  };
  
  registerToken();

  // Set up a listener to handle incoming notifications when the app is in the foreground
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log("Notification received:", notification);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
  };
}, []);

const registerForPushNotificationsAsync = async () => {
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
      // console.log('Expo Push Token:', token); // Debugging line
    } catch (error) {
      Alert.alert('Error getting push token', error.message);
    }
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  setExpoPushToken(token);
  return token;
};


const sendPushNotification = async (message) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: 'New Friend Request',
      body: message,
    }),
  });
};



const fetchUpcomingMeetings = async () => {
  try {
    const meetings = await getUpcomingMeetings();
    setUpcomingMeetings(meetings);
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
  }
};

const filteredMeetings = upcomingMeetings.filter(
  (meeting) => (meeting.user1 === currentUser.getUsername() || meeting.user2 === currentUser.getUsername())
);


const fetchConnectionRequests = async () => {
  try {
    const pendingRequests = await getPendingRequests();

    // Check if there are any requests that need a response
    const requestsToRespondTo = pendingRequests.filter(request => request.status === 'pending');

    if (requestsToRespondTo.length > 0) {
      if (expoPushToken) {
        sendPushNotification(`You have ${requestsToRespondTo.length} friend requests to review.`);
      } else {
        console.log('Expo push token not yet available.');
      }
    }

    setConnectionRequests(pendingRequests);
  } catch (error) {
    console.error('Error fetching connection requests:', error);
  }
};


useEffect(() => {
  
  fetchConnectionRequests();
  fetchUpcomingMeetings();
}, []);

 //This allows the users to switch between all connection requests and meeting requests, might just allow connections
  const toggleRequests = () => {
    setShowConnectionRequests(!showConnectionRequests);
  };

  const renderConnectionRequest = ({ item }) => (
    <View style={localStyles.notificationItem}>
      <Text style={{ color: styles.loadingText.color }}>{item.name}</Text>
      <View style={localStyles.buttonContainer}>
        <TouchableOpacity
          style={localStyles.actionButton}
          onPress={async () => {
            try {
              await handleFriendRequest(item.requestId, 'accept');
              Alert.alert('Request Accepted', `You have accepted the request from ${item.name}.`);
              
              // Update the UI to remove the accepted request
              setConnectionRequests(prevRequests =>
                prevRequests.filter(request => request.id !== item.id)
              );
            } catch (error) {
              console.error('Error accepting friend request:', error);
              Alert.alert('Error', 'Failed to accept the request. Please try again.');
            }
          }}
        >
          <Text style={localStyles.actionButtonText}>Connect</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={localStyles.actionButton}
          onPress={async () => {
            try {
              await handleFriendRequest(item.requestId, 'deny');
              Alert.alert('Request Denied', `You have denied the request from ${item.name}.`);
              
              // Update the UI to remove the denied request
              setConnectionRequests(prevRequests =>
                prevRequests.filter(request => request.id !== item.id)
              );
            } catch (error) {
              console.error('Error denying friend request:', error);
              Alert.alert('Error', 'Failed to deny the request. Please try again.');
            }
          }}
        >
          <Text style={localStyles.actionButtonText}>Ignore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  

const renderMeetRequest = ({ item }) => (
  <View style={localStyles.notificationItem}>
    <Text style={{ color: styles.loadingText.color }}>
      {item.user1} & {item.user2} - Meet at {item.location} on {new Date(item.date).toLocaleDateString()} at {item.time}
    </Text>
  </View>
);

return (
  <View style={styles.container}>
    <View style={styles.switchContainer}>
      <TouchableOpacity
        style={[styles.switchButton, showConnectionRequests && styles.activeButton]}
        onPress={() => setShowConnectionRequests(true)}
      >
        <Text style={styles.switchText}>Connection Requests</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.switchButton, !showConnectionRequests && styles.activeButton]}
        onPress={() => setShowConnectionRequests(false)}
      >
        <Text style={styles.switchText}>Meet Requests</Text>
      </TouchableOpacity>
    </View>

    {showConnectionRequests ? (
      connectionRequests.length > 0 ? (
        <FlatList
          data={connectionRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderConnectionRequest}
          style={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>No pending requests</Text>
      )
    ) : (
      upcomingMeetings.length > 0 ? (
        <FlatList
        data={filteredMeetings}
          keyExtractor={(item) => item.id}
          renderItem={renderMeetRequest}
          style={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>No upcoming meetings</Text>
      )
    )}
  </View>
);
};

//Local styling that is not using the global styling from Styles.js
const localStyles = StyleSheet.create({
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NotificationsModal;