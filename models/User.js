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
  setFirstName(firstName){
    this.user.set('firstName', firstName);
  }

  setLastName(lastName){
    this.user.set('lastName', lastName)
  }

  setEmail(email) {
    this.user.set('email', email);
  }


  setPhoneNumber(phoneNumber) {
  
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Invalid phone number format. Must be between 10 to 15 digits.');
    }
    this.user.set('phoneNumber', phoneNumber);
  }

  setUsername(username) {
    this.user.set('username', username);
  }

  setPassword(password) {
    this.user.set('password', password);
  }

  async signUp() {
    try {
      const result = await this.user.signUp();
      return result; 
    } catch (err) {
      throw new Error(err.message); 
    }
  }

  static async login(username, password) {
    try {
      const user = await Parse.User.logIn(username, password);
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async logout() {
    try {
      await Parse.User.logOut();
    } catch (err) {
      throw new Error(err.message);
    }
  }

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
      console.log("Current friends array " + friends.length)
    // Fetch details for each friend (friends may be stored as pointers or objects)
    for (let friendPointer of friends) {
      try {
        const friend = await friendPointer.fetch(); // Fetch the actual user object
        console.log(`Friend: ${friend.get('username')}, Email: ${friend.get('email')}`);
      } catch (error) {
        console.error('Error fetching friend details:', error);
      }
    }
  }
}

export default User;
