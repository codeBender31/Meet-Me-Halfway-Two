//This modal will display any meeting objects that have been stored in the database and already sent out through sms
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Parse from 'parse/react-native.js';
import { AuthContext } from '../context/AuthContext';
import { determineGlobalStyles } from './Styles';

const ScheduledMeetings = () => {
const {darkMode} = useContext(AuthContext)
const {styles} = determineGlobalStyles(darkMode)

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  //Pull to refresh state control
  const [refreshing, setRefreshing] = useState(false);

  //Function to help when refresh has been set
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchMeetings();
    }, 1000); 
  };  

  const fetchMeetings = async () => {
    const currentUser = Parse.User.current();
    // setLoading(true);
    if (!currentUser) {
      return; // User is not logged in
    }

    try {
      // Query where user1 is the current user
      const query1 = new Parse.Query('Meeting');
      query1.equalTo('user1', currentUser);
      query1.include('user1'); 
      query1.include('user2');

      // Query where user2 is the current user
      const query2 = new Parse.Query('Meeting');
      query2.equalTo('user2', currentUser);
      query2.include('user1'); 
      query2.include('user2');

      // Combine the two queries with the OR operator
      const mainQuery = Parse.Query.or(query1, query2);
      const results = await mainQuery.find();

      // console.log('Meetings JSON:', results.map((meeting) => meeting.toJSON()));
      const usernames = results.map((meeting) => {
        const user1 = meeting.get('user1');
        const user2 = meeting.get('user2');
        return {
          user1: user1 ? user1.get('username') : 'N/A',
          user2: user2 ? user2.get('username') : 'N/A',
        };
      });
      console.log('Usernames in Meetings:', usernames);

      setMeetings(results);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <Text>No scheduled meetings found.</Text>
      )}
    </View>
  );
};

export default ScheduledMeetings;
