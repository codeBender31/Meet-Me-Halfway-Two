//This will serve as the notifications modal accessible from the side menu
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { determineGlobalStyles } from '../components/Styles'; 
//Import the backend components from Connection
import { getPendingRequests, handleFriendRequest } from '../models/Connection'; 
import { AuthContext } from '../context/AuthContext';

const NotificationsModal = () => {
const {darkMode} = useContext(AuthContext)
  //Inherit styling from Styles.js
  let { styles } = determineGlobalStyles(darkMode);
  //Show the connection requests from the backend
  const [showConnectionRequests, setShowConnectionRequests] = useState(true);
  //This was the place holder variable name, will delete and convert to showConnectionRequests once debugging is complete
  const [connectionRequests, setConnectionRequests] = useState([]);
  //Fake meeting requests that serve as placeholders 
  const [meetRequests, setMeetRequests] = useState([
    { id: '1', name: 'Emily Davis', time: '3:00 PM' },
    { id: '2', name: 'Michael Scott', time: '5:30 PM' },
  ]);

  useEffect(() => {
  
    fetchConnectionRequests();
  }, []);
//Obtain all connection requests from the database
  const fetchConnectionRequests = async () => {
    try {
      const pendingRequests = await getPendingRequests(); 
      setConnectionRequests(pendingRequests);  
    } catch (error) {
      //Else throwout the error 
      console.error('Error fetching connection requests:', error);
    }
  };

 //This allows the users to switch between all connection requests and meeting requests, might just allow connections
  const toggleRequests = () => {
    setShowConnectionRequests(!showConnectionRequests);
  };

 //Render the fetched items
  const renderConnectionRequest = ({ item }) => (
    <View style={localStyles.notificationItem}>
      <Text style={{ color: styles.loadingText.color }}>{item.name}</Text>
      <View style={localStyles.buttonContainer}>
        {/* Here the user is able to deny or accept requests, reference here if any issues arise*/}
        {/*I know there is an error that comes up I'm currently finding out why */}
        <TouchableOpacity
          style={localStyles.actionButton}
          onPress={() => handleFriendRequest(item.requestId, 'accept')} 
        >
          <Text style={localStyles.actionButtonText}>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.actionButton}
          onPress={() => handleFriendRequest(item.requestId, 'deny')}  
        >
          <Text style={localStyles.actionButtonText}>Ignore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

 //This will render the placeholder meeting requests
  const renderMeetRequest = ({ item }) => (
    <View style={localStyles.notificationItem}>
      <Text style={{ color: styles.loadingText.color }}>{item.name} - Meet at {item.time}</Text>
      <View style={localStyles.buttonContainer}>
        <TouchableOpacity style={localStyles.actionButton}>
          {/*Since they are placeholder buttons, no action will be taken for now */}
          <Text style={localStyles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.actionButton}>
          <Text style={localStyles.actionButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
//Return the view and allow the user to toggle between connection/meeting details 
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

  {/*If any connection requests are present in the database then render them*/}
      {showConnectionRequests ? (
        connectionRequests.length > 0 ? (
          <FlatList
            data={connectionRequests}
            keyExtractor={(item) => item.id}
            renderItem={renderConnectionRequest}
            style={styles.list}
          />
        ) : (
          //Otherwise show No pending requests 
          <Text style={styles.noDataText}>No pending requests</Text>  
        )
      ) : (
        //Otherwise render the meet requests 
        //Need to fix this issue as well 
        <FlatList
          data={meetRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderMeetRequest}
          style={styles.list}
        />
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
