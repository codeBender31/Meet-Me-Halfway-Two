//This will serve as the blue print for the user class
//In order to register a user will need to provide 
// First Name
// Last Name
// Email Address
// Username 
// Password
// Confirm Password
import Parse from 'parse/react-native.js';

class User {
  constructor() {
    this.user = new Parse.User();
  }
  //Set user first name 
  setFirstName(firstName){
    this.user.set('firstName', firstName);
  }
//Set the user last name 
  setLastName(lastName){
    this.user.set('lastName', lastName)
  }
//Set the user email 
  setEmail(email) {
    this.user.set('email', email);
  }
//Set the user phone number 
  setPhoneNumber(phoneNumber) {
  //Set the regular expression that contains bounds 
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Invalid phone number format. Must be between 10 to 15 digits.');
    }
    //If it is valid then set the phone number 
    this.user.set('phoneNumber', phoneNumber);
  }
//Set the user name for the user 
  setUsername(username) {
    this.user.set('username', username);
  }
//Set the password for the user 
  setPassword(password) {
    this.user.set('password', password);
  }
//Call the async signup method 
  async signUp() {
    //Await for the response 
    try {
      const result = await this.user.signUp();
      return result; 
    } catch (err) { //Throw out any errors if present 
      throw new Error(err.message); 
    }
  }
//Call the async login method 
  static async login(username, password) {
    try {
      const user = await Parse.User.logIn(username, password);
      return user;
    } catch (err) {//Throw out any errors if present 
      throw new Error(err.message);
    }
  }
//Call the async logout method 
  static async logout() {
    try {
      await Parse.User.logOut();
    } catch (err) {//Throw out any errors if present 
      throw new Error(err.message);
    }
  }
//Get the current user that is logged in 
  static getCurrentUser() {
    return Parse.User.current();
  }


  // This is only for debugging, to make sure friends are being added
// This is only for debugging, to make sure friends are being added
// This is only for debugging, to make sure friends are being added
static async getFriends() {
  let currentUser = Parse.User.current();

  // Double-check that a user is logged in
  if (!currentUser) {
    console.log('No user is currently logged in.');
    return;
  }

  try {
    // Refetch currentUser to get the latest data, including the friends list
    currentUser = await currentUser.fetch();

    // Retrieve the friends array (which consists of full user objects)
    const friends = currentUser.get('friends');

    // Check if friends array is valid and has data
    if (!friends || friends.length === 0) {
      console.log('No friends found for this user. You can find this log in the User model');
      return;
    }

    // Log the length of the friends array
    console.log('Number of friends:', friends.length);

    // Iterate through each friend (already a full user object)
    for (let friend of friends) {
      try {
        // Directly access friend details since it is already a full object
        console.log(`Friend: ${friend.username}, Email: ${friend.email}`);
      } catch (error) {
        console.error('Error accessing friend details:', error);
      }
    }
  } catch (error) {
    console.error('Error refetching the current user:', error);
  }
}
}

export default User;
