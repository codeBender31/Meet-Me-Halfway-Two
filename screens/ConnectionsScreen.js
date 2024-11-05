//This will have selector at the top to swithc between Find Connections and My Connections
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Image, TextInput, Modal } from 'react-native';
import { determineGlobalStyles } from '../components/Styles';
import { getMyConnections, getAllUsers, getPendingRequests, handleFriendRequest, removeFriend, sendFriendRequest} from '../models/Connection';  // Import the getPendingRequests and handleFriendRequest functions
import User from '../models/User'
import Connection from '../models/Connection'
import { AuthContext } from '../context/AuthContext';
const ConnectionsScreen = () => {
  const {darkMode} = useContext(AuthContext)
  let { styles } = determineGlobalStyles(darkMode);
  const [view, setView] = useState('myConnections');  

  //Print the friends for testing and double checking connections work
  User.getFriends();

  const [myConnections, setMyConnections] = useState([]);
  const [allConnections, setAllConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [disabledButtons, setDisabledButtons] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConnections, setFilteredConnections] = useState([]);

  

  useEffect(() => {
  
    fetchData();
  }, []);
//Helper function to open selected profile picture
  const openImageModal = (imageUri) => {
    setSelectedImage(imageUri);
  };
  //Helper function to close selected profile picture 
  const closeImageModal = () => {
    setSelectedImage(null);
  };
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
      // setPendingRequests(pendingRequestsList); 
      setFilteredConnections(view === 'myConnections' ? userConnections : allUsers); 

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (view === 'myConnections') {
      setFilteredConnections(
        myConnections.filter(connection =>
          connection.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else if (view === 'allConnections') {
      setFilteredConnections(
        allConnections.filter(connection =>
          connection.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, view, myConnections, allConnections]);
  
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
       <TouchableOpacity onPress={() => openImageModal(item.profilePicture)}>
      <Image source={{ uri: item.profilePicture }} style={localStyles.profileImage} />
      </TouchableOpacity>
      <Text style={{ color: styles.loadingText.color, fontWeight: 'bold'}}>{item.name}</Text>
      {myConnections.length > 0 && (
        <View style={localStyles.buttonContainer}>
          {/* <TouchableOpacity style={localStyles.actionButton} onPress={() => {}}>
            <Text style={localStyles.actionButtonText}>Request Meeting</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={localStyles.actionButton} onPress={() => handleRemoveFriend(item.id)}>
            <Text style={localStyles.actionButtonText}>Remove Connection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderAllConnection = ({ item }) => {
    const isAlreadyFriend = myConnections.some(connection => connection.id === item.id); 
    const isButtonDisabled = disabledButtons[item.id] === true;
  
    return (
      <View style={localStyles.connectionItem}>
         <TouchableOpacity onPress={() => openImageModal(item.profilePicture)}>
        <Image source={{ uri: item.profilePicture }} style={localStyles.profileImage} />
        </TouchableOpacity>
        <Text style={{ color: styles.loadingText.color, fontWeight: 'bold',}}>{item.name}</Text>
        {!isAlreadyFriend && (
          <View style={localStyles.buttonContainer}>
            <TouchableOpacity 
              style={[localStyles.actionButton, isButtonDisabled && localStyles.disabledButton]} 
              onPress={() => {
                setDisabledButtons(prev => ({ ...prev, [item.id]: true }));
                // Call sendFriendRequest function and pass the user ID
                sendFriendRequest(item.id).then(() => {
                  console.log(`Friend request sent to ${item.name}`);
                  Alert.alert("Request Sent", `Friend request sent to ${item.name} successfully!`);
                  fetchData(); // Refresh data after sending the request
                }).catch(error => {
                  console.error('Error sending friend request:', error);
                });
              }}
              disabled={isButtonDisabled}
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

      <TextInput
      style={localStyles.searchBar}
      placeholder="Search connections..."
     placeholderTextColor="#888"
    value={searchTerm}
    onChangeText={setSearchTerm}
    />

     
      {view === 'myConnections' && myConnections.length > 0 && (
        <FlatList
          // data={myConnections}
          data={filteredConnections}
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
          // data={allConnections}
          data={filteredConnections}
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

{selectedImage && (
  <Modal visible={true} transparent={true} animationType="fade" onRequestClose={closeImageModal}>
    <View style={localStyles.modalContainer}>
      <TouchableOpacity style={localStyles.modalCloseButton} onPress={closeImageModal}>
        <Text style={localStyles.modalCloseText}>Close</Text>
      </TouchableOpacity>
      <Image source={{ uri: selectedImage }} style={localStyles.modalImage} />
    </View>
  </Modal>
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
    // justifyContent: 'space-between',
    justifyContent: 'flex-start',
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
    marginLeft: 30,
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
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
  },
  searchBar: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
    color: 'black',
    backgroundColor: 'white',
    width: '100%'
  },
});

export default ConnectionsScreen;
