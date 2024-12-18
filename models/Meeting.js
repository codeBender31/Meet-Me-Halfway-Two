//This will be the model for meeting objects
import Parse from 'parse/react-native.js';
import { Linking } from 'react-native';
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
const openGoogleMaps = (latitude, longitude) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  Linking.openURL(url).catch(err => console.error('Error opening Google Maps:', err));
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
  const TWILIO_SID = 'ACc9e5ba46f556939d783038cc0cb69cb2';
  //Twilio auth token
  const TWILIO_AUTH_TOKEN = 'fe385249d46e6d927614ba7b26b181f8';
  //Twilio phone number 
  const TWILIO_PHONE_NUMBER = '+18447553198';
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
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };
//Send the actual sms to both users 
  sendSms(user1.get('phoneNumber'), messageBody);
  sendSms(user2.get('phoneNumber'), messageBody);
};

export { createMeeting, openGoogleMaps };

