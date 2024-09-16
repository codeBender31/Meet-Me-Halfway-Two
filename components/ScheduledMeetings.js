//This modal will display any meeting objects that have been stored in the database and already sent out through sms
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
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
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View>
      <Text>Scheduled Meetings</Text>
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
              <View style={{ padding: 10, borderBottomWidth: 1 }}>
                <Text>Meeting with: {otherUser.get('username')}</Text>
                <Text>Location: {location}</Text>
                <Text>Date: {date}</Text>
                <Text>Time: {time}</Text>
              </View>
            );
          }}
        />
      ) : (
        <Text>No scheduled meetings found.</Text>
      )}
    </View>
  );
};

export default ScheduledMeetings;
