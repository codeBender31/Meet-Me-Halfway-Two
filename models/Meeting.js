//This will be the model for meeting objects
import Parse from 'parse/react-native.js';
import { Linking, Platform } from 'react-native';
import axios from 'axios';

//Method to create meeting object between two users 
const createMeeting = async (user1Id, user2Id, location, coordinates, time, date) => {
  //Defining the class for meeting objects 
  const Meeting = Parse.Object.extend('Meeting');
  //Constructor call for meeting object 
  const newMeeting = new Meeting();
  //Query for user1 info
  const user1Query = new Parse.Query(Parse.User);
  //Query for user2 info 
  const user2Query = new Parse.Query(Parse.User);

  try {
    //Await for both user ids
    const user1 = await user1Query.get(user1Id);
    const user2 = await user2Query.get(user2Id);

    //Set the fields for each field 
    newMeeting.set('user1', user1);
    newMeeting.set('user2', user2);
    newMeeting.set('location', location);
    newMeeting.set('coordinates', new Parse.GeoPoint(coordinates.lat, coordinates.lng));
    newMeeting.set('time', time);
    newMeeting.set('date', date);
    //Save the new properties 
    const result = await newMeeting.save();
    //Log to console to make sure it was created successfully 
    console.log('Meeting created successfully:', result);
    //Call the function to send via sms
    sendMeetingNotificationViaTwilio(user1, user2, result);
    
  } catch (error) {
    console.error('Error creating meeting:', error);
  }
};

//Method to load the location on to google maps 
// const openGoogleMaps = (latitude, longitude) => {
//   const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
//   Linking.openURL(url).catch(err => console.error('Error opening Google Maps:', err));
// };

const openGoogleMaps = (latitude, longitude) => {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const appleMapsUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
  // const appleMapsUrl = `http://maps.apple.com/?saddr=${startLatitude},${startLongitude}&daddr=${latitude},${longitude}`;
  if (Platform.OS === 'ios') {
    // Check if Google Maps is installed on iOS
    Linking.canOpenURL('comgooglemaps://').then((supported) => {
      if (supported) {
        Linking.openURL(`comgooglemaps://?daddr=${latitude},${longitude}`).catch((err) =>
          console.error('Error opening Google Maps:', err)
        );
      } else {
        // Fallback to Apple Maps
        Linking.openURL(appleMapsUrl).catch((err) =>
          console.error('Error opening Apple Maps:', err)
        );
      }
    });
  } else {
    // Default to Google Maps on Android or browser fallback
    Linking.openURL(googleMapsUrl).catch((err) =>
      console.error('Error opening Google Maps:', err)
    );
  }
};

//Helper function to correctly format the phone number 
const formatNumbers = (phoneNumber) => {
const UScode = '1'
return `+${UScode}${phoneNumber}`
};

//Methdo to send the meeting object via sms 
const sendMeetingNotificationViaTwilio = async (user1, user2, meeting) => {
  //Define the twilio api necessary info 
  //Twilio sid 
  const TWILIO_SID = '';
  //Twilio auth token
  const TWILIO_AUTH_TOKEN = '';
  //Twilio phone number 
  const TWILIO_PHONE_NUMBER = '';
//Get the username of user1 and user 2
  const messageBody = `Meeting set between ${user1.get('username')} and ${user2.get('username')} at ${meeting.get('location')} on ${meeting.get('date')} at ${meeting.get('time')}.`;
//Send the sms 
  const sendSms = async (to, body) => {
    try {
      const formattedPhoneNumber = formatNumbers(to);
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        new URLSearchParams({
          //Set the params for the sms 
          //twilio #
          From: TWILIO_PHONE_NUMBER,
          //to both users 
          To: formattedPhoneNumber,
          //The body of the message 
          Body: body,
        }),
        {
          auth: {
            username: TWILIO_SID,
            password: TWILIO_AUTH_TOKEN,
          },
        }
      );
      console.log(`SMS sent successfully to ${to}`);
      console.log(`Twilio response:`, response.data);
    } catch (error) {
      // console.error('Error sending SMS:', error);
    }
  };
//Send the actual sms to both users 
  sendSms(user1.get('phoneNumber'), messageBody);
  sendSms(user2.get('phoneNumber'), messageBody);
};

// Method to get all upcoming meetings
const getUpcomingMeetings = async () => {
  const Meeting = Parse.Object.extend('Meeting');
  const query = new Parse.Query(Meeting);
  const currentDate = new Date();

  query.greaterThanOrEqualTo('date', currentDate); // Only fetch meetings with a future date
  query.ascending('date'); // Sort by date in ascending order

  try {
    const upcomingMeetings = await query.find();
    // console.log('Upcoming meetings:', upcomingMeetings);
    return upcomingMeetings.map(meeting => ({
      id: meeting.id,
      location: meeting.get('location'),
      coordinates: meeting.get('coordinates'),
      date: meeting.get('date'),
      time: meeting.get('time'),
      user1: meeting.get('user1').get('username'),
      user2: meeting.get('user2').get('username'),
    }));
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    return [];
  }
};

// //Method to send meeting details
// Parse.Cloud.run("sendMeetingEmail", {
//   userEmails: ["user1@example.com", "user2@example.com"],
//   meetingDetails: "Meeting scheduled at 10:00 AM on 20th November."
// }).then((response) => {
//   console.log(response); // Meeting details sent to 2 recipients.
// }).catch((error) => {
//   console.error("Error:", error.message);
// });

export { createMeeting, openGoogleMaps, getUpcomingMeetings };

