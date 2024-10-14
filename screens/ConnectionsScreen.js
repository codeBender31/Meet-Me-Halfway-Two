
//This will have selector at the top to swithc between Find Connections and My Connections
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { determineGlobalStyles } from '../components/Styles';
import { getMyConnections, getAllUsers, getPendingRequests, handleFriendRequest, removeFriend, sendFriendRequest} from '../models/Connection';  // Import the getPendingRequests and handleFriendRequest functions
import User from '../models/User'
import Connection from '../models/Connection'
import { AuthContext } from '../context/AuthContext';

const ConnectionsScreen = () => {
  const {darkMode} = useContext(AuthContext)
  let { styles } = determineGlobalStyles(darkMode);
  const [view, setView] = useState('myConnections');  

  const [myConnections, setMyConnections] = useState([]);
  const [allConnections, setAllConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [filteredMyConnections, setFilteredMyConnections] = useState([]); // New state for filtered "My Connections"
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // Search query for "All Connections"
  const [searchMyConnectionsQuery, setSearchMyConnectionsQuery] = useState(''); // Search query for "My Connections"
  const [page, setPage] = useState(1);  // Current page for pagination
  const [loading, setLoading] = useState(false);  // Loading state for pagination
  const [hasMore, setHasMore] = useState(true); // Track if there are more connections to load
  const pageSize = 8;  // Number of connections to load per page

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    if (view === 'allConnections') {
      filterConnections(searchQuery);
    }
  }, [searchQuery, allConnections]);

  useEffect(() => {
    if (view === 'myConnections') {
      filterMyConnections(searchMyConnectionsQuery);
    }
  }, [searchMyConnectionsQuery, myConnections]);

  const handleRemoveFriend = async (friendUserId) => {
    try {
      await removeFriend(friendUserId); 
      fetchData();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const fetchData = async () => {
    if (!hasMore && page > 1) return; // If there are no more connections to load, exit early

    try {
      setLoading(true);  // Set loading to true when fetching data
      const userConnections = await getMyConnections();
      const allUsers = await getAllUsers();  // Fetch all users
      const pendingRequestsList = await getPendingRequests();

      // Implement pagination logic for connections
      const paginatedUsers = allUsers.slice((page - 1) * pageSize, page * pageSize);

      if (paginatedUsers.length < pageSize) {
        setHasMore(false);  // If fewer than pageSize items are returned, no more to load
      }

      if (page === 1) {
        setAllConnections(paginatedUsers);
        setFilteredConnections(paginatedUsers);
      } else {
        setAllConnections(prevConnections => [...prevConnections, ...paginatedUsers]);
        setFilteredConnections(prevConnections => [...prevConnections, ...paginatedUsers]);
      }

      setMyConnections(userConnections); 
      setFilteredMyConnections(userConnections); // Initially set filtered "My Connections"
      setPendingRequests(pendingRequestsList); 
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);  // Set loading to false when done
    }
  };

  // Filter for "All Connections"
  const filterConnections = (query) => {
    if (!query) {
      setFilteredConnections(allConnections); // Show all connections if no search query
      return;
    }
    const filtered = allConnections.filter(connection => 
      connection.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredConnections(filtered);
  };

  // Filter for "My Connections"
  const filterMyConnections = (query) => {
    if (!query) {
      setFilteredMyConnections(myConnections); // Show all my connections if no search query
      return;
    }
    const filtered = myConnections.filter(connection => 
      connection.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMyConnections(filtered);
  };

  const loadMoreConnections = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);  // Increment page to load more data
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="large" color="#0000ff" />;
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

      {/* Search Input for "My Connections" */}
      {view === 'myConnections' && (
        <TextInput
          style={localStyles.searchInput}
          placeholder="Search My Connections"
          value={searchMyConnectionsQuery}
          onChangeText={setSearchMyConnectionsQuery}  // Update search query for "My Connections"
        />
      )}

      {/* Search Input for "All Connections" */}
      {view === 'allConnections' && (
        <TextInput
          style={localStyles.searchInput}
          placeholder="Search Connections"
          value={searchQuery}
          onChangeText={setSearchQuery}  // Update search query for "All Connections"
        />
      )}

      {/* Render "My Connections" */}
      {view === 'myConnections' && filteredMyConnections.length > 0 && (
        <FlatList
          data={filteredMyConnections}
          keyExtractor={(item) => item.id}
          renderItem={renderMyConnection}
          style={styles.list}
        />
      )}
      {view === 'myConnections' && filteredMyConnections.length === 0 && (
        <Text style={styles.noDataText}>No connections available</Text> 
      )}

      {/* Render "All Connections" */}
      {view === 'allConnections' && (
        <FlatList
          data={filteredConnections} // Use filtered connections for all connections view
          keyExtractor={(item) => item.id}
          renderItem={renderAllConnection}
          style={styles.list}
          onEndReached={loadMoreConnections} // Load more when user reaches end of list
          onEndReachedThreshold={0.5} // Trigger loading when 50% of the list is reached
          ListFooterComponent={renderFooter} // Show loading indicator at bottom
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
  },
  searchInput: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginVertical: 10,
    color: 'black',
  }
});

export default ConnectionsScreen;
