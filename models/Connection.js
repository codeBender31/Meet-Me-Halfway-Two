//This is the connection class
//Its main job is to help users add connections / remove connections
//Import the parse sdk 
import Parse from 'parse/react-native.js';

//Create a variable to hold the connection obj class 
const Connection = Parse.Object.extend("Connection");

const getMyConnections = async () => {
  const currentUser = Parse.User.current();
  
  // Double-check that a user is logged in
  if (!currentUser) {
    console.error('No current user logged in!');
    return [];
  }

  // Define queries for sender and receiver roles
  const queryAsSender = new Parse.Query("Connection");
  queryAsSender.equalTo("sender", currentUser);
  queryAsSender.equalTo("status", "accepted");

  const queryAsReceiver = new Parse.Query("Connection");
  queryAsReceiver.equalTo("receiver", currentUser);
  queryAsReceiver.equalTo("status", "accepted");

  // Combine the queries to send to Parse
  const combinedQuery = Parse.Query.or(queryAsSender, queryAsReceiver);

  try {
    // Wait for async function to finish sending the combined query
    const connections = await combinedQuery.find();

    // Use Promise.all to handle async operations inside the map
    const completedConnections = await Promise.all(
      connections.map(async (conn, index) => {
        // Determine who the other user is
        let otherUser = conn.get("sender").id === currentUser.id ? conn.get("receiver") : conn.get("sender");

        // Retry mechanism to fix latency issues
        if (!otherUser || typeof otherUser.get('username') === 'undefined') {
          // Attempt to re-fetch the missing user data
          try {
            console.log(`Re-fetching user data for connection ${index + 1}...`);
            const userQuery = new Parse.Query(Parse.User);
            otherUser = await userQuery.get(otherUser.id);
          } catch (error) {
            console.error(`Error re-fetching user for connection ${index + 1}:`, error);
            return { id: 'undefined', name: 'N/A' };
          }
        }

        // Return the completed connection details
        return { 
          id: otherUser.id, 
          name: otherUser.get('username'),
          profilePicture: otherUser.get('profilePicture')?.url() || null 
        };
      })
    );

    return completedConnections;
  } catch (error) {
    console.error('Error fetching connections:', error);
    return [];
  }
};


//To showcase all users from the database 
const getAllUsers = async () => {
  const currentUser = Parse.User.current();
  //Double check again if the user is properly logged in first 
  //Will delete once the app is finished 
  if (!currentUser) {
    console.error('No current user logged in!');
    return [];
  }
//Create a query to obtain the current user's id 
  const query = new Parse.Query(Parse.User);
  query.notEqualTo("objectId", currentUser.id); 
//Show all the users that are not the current logged in user 
  try {
    const users = await query.find();
    return users.map(user => ({
      id: user.id,
      name: user.get("username"),
      profilePicture: user.get("profilePicture")?.url() || null 
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

//Method to send friend requests 
const sendFriendRequest = async (receiverUserId) => {
//Create a new request 
  const newRequest = new Connection();
  const sender = Parse.User.current();

  if (!sender) {
    console.error('No current user logged in!');
    return;
  }

  try {
    const receiverQuery = new Parse.Query(Parse.User);
    const receiver = await receiverQuery.get(receiverUserId);

    newRequest.set("sender", sender);
    newRequest.set("receiver", receiver);
    newRequest.set("status", "pending");

    await newRequest.save();
    console.log('Friend request sent successfully!');
  } catch (error) {
    console.error('Error sending friend request:', error);
  }
};

// const addToFriendsList = async (user1, user2) => {
//   try {
//     // Set ACLs for user1
//     const acl1 = user1.getACL() || new Parse.ACL(user1);
//     acl1.setReadAccess(user2, true);
//     acl1.setWriteAccess(user2, true);
//     user1.setACL(acl1);

//     // Set ACLs for user2
//     const acl2 = user2.getACL() || new Parse.ACL(user2);
//     acl2.setReadAccess(user1, true);
//     acl2.setWriteAccess(user1, true);
//     user2.setACL(acl2);

//     // Add each other to friends lists
//     user1.addUnique("friends", user2);
//     user2.addUnique("friends", user1);

//     // Save both users with the master key to override ACL restrictions
//     await Promise.all([
//       user1.save(null, { useMasterKey: true }),
//       user2.save(null, { useMasterKey: true }),
//     ]);

//     console.log(`Users ${user1.get('username')} and ${user2.get('username')} added to each other's friends list.`);
//   } catch (error) {
//     console.error('Error adding users to friends list:', error);
//     throw error;
//   }
// };
const addToFriendsList = async (user1, user2) => {
  try {
    // Call the Cloud Function to add users as friends
    const response = await Parse.Cloud.run("addFriends", {
      user1Id: user1.id,
      user2Id: user2.id,
    });

    console.log(response); // Logs success message from the cloud function
  } catch (error) {
    console.error("Error calling cloud function to add friends:", error);
  }
};

// const addToFriendsList = async (user1, user2) => {
//   try {
//     // Get or create ACL for user1 and user2
//     const acl1 = user1.getACL() || new Parse.ACL(user1);
//     const acl2 = user2.getACL() || new Parse.ACL(user2);

//     // Grant user1 read/write access to user2 and vice versa
//     acl1.setReadAccess(user2, true);
//     acl1.setWriteAccess(user2, true);
//     acl2.setReadAccess(user1, true);
//     acl2.setWriteAccess(user1, true);

//     // Update ACLs on the entire user object for mutual access
//     user1.setACL(acl1);
//     user2.setACL(acl2);

//     // Add each other as unique friends
//     user1.addUnique("friends", user2);
//     user2.addUnique("friends", user1);

//     // Save both users with updated friend lists and ACLs
//     await Promise.all([user1.save(), user2.save()]);

//     console.log(`Users ${user1.get('username')} and ${user2.get('username')} added to each other's friends list.`);
//   } catch (error) {
//     console.error('Error adding users to friends list:', error);
//     throw error;
//   }
// };

// //Method to add two users to eachother's friends list 
// const addToFriendsList = async (user1, user2) => {
//   try {
 
//     const acl1 = user1.getACL() || new Parse.ACL(user1);
//     //Set the access controls for user1 to true to allow writing
//     acl1.setWriteAccess(user1, true); 

  
//     const acl2 = user2.getACL() || new Parse.ACL(user2);
//     //Set the access controls for user2 to true to allow writing 
//     acl2.setWriteAccess(user2, true);  

//     // Update both users' ACL
//     user1.setACL(acl1);
//     user2.setACL(acl2);
//     //Add to friends array for user1
//     user1.addUnique("friends", user2);

//     //Add to friends array for user 2
//     user2.addUnique("friends", user1);

//    //Save both changes concurrently
//     await Promise.all([user1.save(), user2.save()]);
//     //Log to console incase of error 
//     console.log(`Users ${user1.get('username')} and ${user2.get('username')} added to each other's friends list.`);
//   } catch (error) {
//     console.error('Error adding users to friends list:', error);
//     throw error;
//   }
// };


//Method to remove friends or connections 
const removeFriend = async (friendUserId) => {
  //Create the variables to keep track of the pointers 
  //Set the current user
  const currentUser = Parse.User.current();
  //Create a query variable 
  const query = new Parse.Query(Parse.User);
  //Get the id from the friend we are removing 
  const friendUser = await query.get(friendUserId);
//If both are identified 
  if (currentUser && friendUser) {
    //Remove from current
    currentUser.remove("friends", friendUser);
    //Remove from friend 
    friendUser.remove("friends", currentUser);
//Await async function 
    try {
      await Promise.all([currentUser.save(), friendUser.save()]);
      console.log('Friend removed successfully.');
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  }
};

//This will allow the users to see any pending requests 
const getPendingRequests = async () => {
  //Obtain the current user id
  const currentUser = Parse.User.current();
  if (!currentUser) {
    console.error('No current user logged in!');
    return [];
  }
//Set the necessary variables 
//create a variable for the query 
  const query = new Parse.Query("Connection");
//Obatin the current request from the current user 
  query.equalTo("receiver", currentUser);
  //Only the requests with the pending status 
  query.equalTo("status", "pending");      
//Wait for the method to finish 
//Map the requests to a list of objects 
  try {
    const requests = await query.find();
    return requests.map((request) => {
      const sender = request.get("sender");
      return { //Return the object identifying information 
        id: sender.id, 
        name: sender.get("username"),
        requestId: request.id, 
      };
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
};

//This method allows users to set the status to the requests 
const handleFriendRequest = async (requestId, action) => {
  //Obtain current user 
  const currentUser = Parse.User.current(); 

  if (!currentUser) {
    console.error('No current user logged in!');
    return;
  }

  try {
    //Obtain the specific connection requests 
    const query = new Parse.Query("Connection");
    const request = await query.get(requestId);
//Double check if current user is the designated receiver 
    if (request.get("receiver").id !== currentUser.id) {
      throw new Error('This user is not the receiver of the request!');
    }

  //If the request is accepted 
    if (action === 'accept') {
      request.set("status", "accepted");
      //Save the new status 
      await request.save();

      //Obtain the sender object id 
      const sender = request.get("sender");
      //Add them to each other's friend list 
      await addToFriendsList(currentUser, sender);
      await addToFriendsList(sender, currentUser);
      //Print out any errors 
      console.log(`Sender: ${sender.get('username')}, Receiver: ${currentUser.get('username')}`);
      console.log("Friend request accepted and users added to friends list.");
    } else if (action === 'deny') {//If the request is denied 
      //Set the status 
      request.set("status", "denied");
      await request.save();
      console.log("Friend request denied.");
    }
  } catch (error) {
    console.error('Error handling friend request:', error);
  }
};

//Export the necessary methods and states 
export { 
  getMyConnections, getAllUsers, sendFriendRequest, removeFriend, getPendingRequests, handleFriendRequest };
