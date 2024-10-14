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

  //This is only for debugging, to make sure friends are being added
  static async getFriends() {
    const currentUser = Parse.User.current();
    if (!currentUser) {
      console.log('No user is currently logged in.');
      return;
    }

    const friends = currentUser.get('friends'); // Retrieve the friends array

    if (!friends || friends.length === 0) {
      console.log('No friends found for this user. You can find this log in the User model');
      return;
    }
      //Print the length of the friends array
      // console.log("Current friends array " + friends.length)
    // Fetch details for each friend (friends may be stored as pointers or objects)
    for (let friendPointer of friends) {
      try {
        const friend = await friendPointer.fetch(); // Fetch the actual user object
        // console.log(`Friend: ${friend.get('username')}, Email: ${friend.get('email')}`);
      } catch (error) {
        console.error('Error fetching friend details:', error);
      }
    }
  }
}

export default User;
