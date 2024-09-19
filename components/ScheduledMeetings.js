import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Parse from 'parse/react-native.js';

const ScheduledMeetings = () => {
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scheduled Meetings</Text>
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
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  meetingItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  meetingText: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ScheduledMeetings;
