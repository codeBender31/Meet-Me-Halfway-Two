//This will have selector at the top to swithc between Find Connections and My Connections
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { determineGlobalStyles } from '../components/Styles';
import { getMyConnections, getAllUsers, getPendingRequests, handleFriendRequest, removeFriend, sendFriendRequest} from '../models/Connection';  // Import the getPendingRequests and handleFriendRequest functions
import User from '../models/User'
import Connection from '../models/Connection'

const ConnectionsScreen = () => {
  let { styles } = determineGlobalStyles();
  const [view, setView] = useState('myConnections');  

  //Print the friends for testing and double checking connections work
  User.getFriends();

  const [myConnections, setMyConnections] = useState([]);
  const [allConnections, setAllConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
  
    fetchData();
  }, []);

    const handleRemoveFriend = async (friendUserId) => {
      try {
        await removeFriend(friendUserId); 
        fetchData();
      } catch (error) {
        console.error('Error removing friend:', error);
      }
    };

  const fetchData = async () => {
    try {
      const userConnections = await getMyConnections();
      const allUsers = await getAllUsers();
      const pendingRequestsList = await getPendingRequests();  
      setMyConnections(userConnections); 
      setAllConnections(allUsers);  
      setPendingRequests(pendingRequestsList); 
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderPendingRequest = ({ item }) => (
    <View style={localStyles.connectionItem}>
      <Text style={{ color: styles.loadingText.color }}>{item.name}</Text>
      <View style={localStyles.buttonContainer}>
        <TouchableOpacity style={localStyles.actionButton} onPress={() => handleFriendRequest(item.requestId, 'accept')}>
          <Text style={localStyles.actionButtonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.actionButton} onPress={() => handleFriendRequest(item.requestId, 'deny')}>
          <Text style={localStyles.actionButtonText}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMyConnection = ({ item }) => (
    <View style={localStyles.connectionItem}>
      <Text style={{ color: styles.loadingText.color }}>{item.name}</Text>
      {myConnections.length > 0 && (
        <View style={localStyles.buttonContainer}>
          <TouchableOpacity style={localStyles.actionButton} onPress={() => {}}>
            <Text style={localStyles.actionButtonText}>Request Meeting</Text>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionButton} onPress={() => handleRemoveFriend(item.id)}>
            <Text style={localStyles.actionButtonText}>Remove Connection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderAllConnection = ({ item }) => {
    const isAlreadyFriend = myConnections.some(connection => connection.id === item.id); 
  
    return (
      <View style={localStyles.connectionItem}>
        <Text style={{ color: styles.loadingText.color }}>{item.name}</Text>
        {!isAlreadyFriend && (
          <View style={localStyles.buttonContainer}>
            <TouchableOpacity 
              style={localStyles.actionButton} 
              onPress={() => {
                // Call sendFriendRequest function and pass the user ID
                sendFriendRequest(item.id).then(() => {
                  console.log(`Friend request sent to ${item.name}`);
                  fetchData(); // Refresh data after sending the request
                }).catch(error => {
                  console.error('Error sending friend request:', error);
                });
              }}
            >
              <Text style={localStyles.actionButtonText}>Add Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[styles.switchButton, view === 'myConnections' && styles.activeButton]}
          onPress={() => setView('myConnections')}
        >
          <Text style={styles.switchText}>My Connections</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchButton, view === 'allConnections' && styles.activeButton]}
          onPress={() => setView('allConnections')}
        >
          <Text style={styles.switchText}>All Connections</Text>
        </TouchableOpacity>

      </View>

     
      {view === 'myConnections' && myConnections.length > 0 && (
        <FlatList
          data={myConnections}
          keyExtractor={(item) => item.id}
          renderItem={renderMyConnection}
          style={styles.list}
        />
      )}
      {view === 'myConnections' && myConnections.length === 0 && (
        <Text style={styles.noDataText}>No connections available</Text> 
      )}

      {view === 'allConnections' && (
        <FlatList
          data={allConnections}
          keyExtractor={(item) => item.id}
          renderItem={renderAllConnection}
          style={styles.list}
        />
      )}

      {view === 'pendingRequests' && pendingRequests.length > 0 && (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderPendingRequest}
          style={styles.list}
        />
      )}
      {view === 'pendingRequests' && pendingRequests.length === 0 && (
        <Text style={styles.noDataText}>No pending requests</Text>  
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  connectionItem: {
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
  noDataText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  }
});

export default ConnectionsScreen;
