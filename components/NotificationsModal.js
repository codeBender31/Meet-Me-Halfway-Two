//This will serve as the notifications modal accessible from the side menu
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { determineGlobalStyles } from '../components/Styles'; 
import { getPendingRequests, handleFriendRequest } from '../models/Connection'; 

const NotificationsModal = () => {
  let { styles } = determineGlobalStyles();
  const [showConnectionRequests, setShowConnectionRequests] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [meetRequests, setMeetRequests] = useState([
    { id: '1', name: 'Emily Davis', time: '3:00 PM' },
    { id: '2', name: 'Michael Scott', time: '5:30 PM' },
  ]);

  useEffect(() => {
  
    fetchConnectionRequests();
  }, []);

  const fetchConnectionRequests = async () => {
    try {
      const pendingRequests = await getPendingRequests(); 
      setConnectionRequests(pendingRequests);  
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    }
  };

 
  const toggleRequests = () => {
    setShowConnectionRequests(!showConnectionRequests);
  };

 
  const renderConnectionRequest = ({ item }) => (
    <View style={localStyles.notificationItem}>
      <Text style={{ color: styles.loadingText.color }}>{item.name}</Text>
      <View style={localStyles.buttonContainer}>
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

 
  const renderMeetRequest = ({ item }) => (
    <View style={localStyles.notificationItem}>
      <Text style={{ color: styles.loadingText.color }}>{item.name} - Meet at {item.time}</Text>
      <View style={localStyles.buttonContainer}>
        <TouchableOpacity style={localStyles.actionButton}>
          <Text style={localStyles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.actionButton}>
          <Text style={localStyles.actionButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
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
