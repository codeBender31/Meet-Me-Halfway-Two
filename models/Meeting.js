//This will be the model for meeting objects
import Parse from 'parse/react-native.js';
import { Linking } from 'react-native';
import axios from 'axios';


const createMeeting = async (user1Id, user2Id, location, coordinates, time, date) => {
  const Meeting = Parse.Object.extend('Meeting');
  const newMeeting = new Meeting();

 
  const user1Query = new Parse.Query(Parse.User);
  const user2Query = new Parse.Query(Parse.User);

  try {
    const user1 = await user1Query.get(user1Id);
    const user2 = await user2Query.get(user2Id);

   
    newMeeting.set('user1', user1);
    newMeeting.set('user2', user2);
    newMeeting.set('location', location);
    newMeeting.set('coordinates', new Parse.GeoPoint(coordinates.lat, coordinates.lng));
    newMeeting.set('time', time);
    newMeeting.set('date', date);

    const result = await newMeeting.save();
    console.log('Meeting created successfully:', result);
    

    sendMeetingNotificationViaTwilio(user1, user2, result);
    
  } catch (error) {
    console.error('Error creating meeting:', error);
  }
};


const openGoogleMaps = (latitude, longitude) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  Linking.openURL(url).catch(err => console.error('Error opening Google Maps:', err));
};


const sendMeetingNotificationViaTwilio = async (user1, user2, meeting) => {
  const TWILIO_SID = 'twilio_sid';
  const TWILIO_AUTH_TOKEN = 'twilio_auth_token';
  const TWILIO_PHONE_NUMBER = 'twilio_phone_number';

  const messageBody = `Meeting set between ${user1.get('username')} and ${user2.get('username')} at ${meeting.get('location')} on ${meeting.get('date')} at ${meeting.get('time')}.`;

  const sendSms = async (to, body) => {
    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
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
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  sendSms(user1.get('phoneNumber'), messageBody);
  sendSms(user2.get('phoneNumber'), messageBody);
};

export { createMeeting, openGoogleMaps };

