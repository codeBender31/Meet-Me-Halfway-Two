
//This modal will display any meeting objects that have been stored in the database and already sent out through sms
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import Parse from 'parse/react-native.js';
import { AuthContext } from '../context/AuthContext';
import { determineGlobalStyles } from './Styles';

const ScheduledMeetings = () => {
const {darkMode} = useContext(AuthContext)
const {styles} = determineGlobalStyles(darkMode)

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      const currentUser = Parse.User.current();
      if (!currentUser) {
        return; // User is not logged in
      }

      try {
        // Query where user1 is the current user
        const query1 = new Parse.Query('Meeting');
        query1.equalTo('user1', currentUser);

        // Query where user2 is the current user
        const query2 = new Parse.Query('Meeting');
        query2.equalTo('user2', currentUser);

        // Combine the two queries with the OR operator
        const mainQuery = Parse.Query.or(query1, query2);
        const results = await mainQuery.find();

        setMeetings(results);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };

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
              </View>
            );
          }}
        />
      ) : (
        <Text style={styles.noDataText}>No scheduled meetings found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  meetingItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  meetingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  noDataText: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ScheduledMeetings;
