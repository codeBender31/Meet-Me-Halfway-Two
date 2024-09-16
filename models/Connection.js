//This is the connection class
//Its main job is to help users add connections / remove connections
import Parse from 'parse/react-native.js';


const Connection = Parse.Object.extend("Connection");


const getMyConnections = async () => {
  const currentUser = Parse.User.current();
  if (!currentUser) {
    console.error('No current user logged in!');
    return [];
  }

  const queryAsSender = new Parse.Query("Connection");
  queryAsSender.equalTo("sender", currentUser);
  queryAsSender.equalTo("status", "accepted");

  const queryAsReceiver = new Parse.Query("Connection");
  queryAsReceiver.equalTo("receiver", currentUser);
  queryAsReceiver.equalTo("status", "accepted");


  const combinedQuery = Parse.Query.or(queryAsSender, queryAsReceiver);

  try {
    const connections = await combinedQuery.find();
    return connections.map((conn) => {

      const otherUser = conn.get("sender").id === currentUser.id ? conn.get("receiver") : conn.get("sender");
      return { id: otherUser.id, name: otherUser.get("username") };
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return [];
  }
};


const getAllUsers = async () => {
  const currentUser = Parse.User.current();
  if (!currentUser) {
    console.error('No current user logged in!');
    return [];
  }

  const query = new Parse.Query(Parse.User);
  query.notEqualTo("objectId", currentUser.id); 

  try {
    const users = await query.find();
    return users.map(user => ({
      id: user.id,
      name: user.get("username"),
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};


const sendFriendRequest = async (receiverUserId) => {
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


const addToFriendsList = async (user1, user2) => {
  try {
 
    const acl1 = user1.getACL() || new Parse.ACL(user1);
    acl1.setWriteAccess(user1, true); 

  
    const acl2 = user2.getACL() || new Parse.ACL(user2);
    acl2.setWriteAccess(user2, true);  

    // Update both users' ACL
    user1.setACL(acl1);
    user2.setACL(acl2);

    user1.addUnique("friends", user2);


    user2.addUnique("friends", user1);

   
    await Promise.all([user1.save(), user2.save()]);
    console.log(`Users ${user1.get('username')} and ${user2.get('username')} added to each other's friends list.`);
  } catch (error) {
    console.error('Error adding users to friends list:', error);
    throw error;
  }
};



const removeFriend = async (friendUserId) => {
  const currentUser = Parse.User.current();
  const query = new Parse.Query(Parse.User);
  const friendUser = await query.get(friendUserId);

  if (currentUser && friendUser) {
    currentUser.remove("friends", friendUser);
    friendUser.remove("friends", currentUser);

    try {
      await Promise.all([currentUser.save(), friendUser.save()]);
      console.log('Friend removed successfully.');
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  }
};


const getPendingRequests = async () => {
  const currentUser = Parse.User.current();
  if (!currentUser) {
    console.error('No current user logged in!');
    return [];
  }

  const query = new Parse.Query("Connection");
  query.equalTo("receiver", currentUser);  
  query.equalTo("status", "pending");      

  try {
    const requests = await query.find();
    return requests.map((request) => {
      const sender = request.get("sender");
      return {
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


const handleFriendRequest = async (requestId, action) => {
  const currentUser = Parse.User.current(); 

  if (!currentUser) {
    console.error('No current user logged in!');
    return;
  }

  try {
    const query = new Parse.Query("Connection");
    const request = await query.get(requestId);

    if (request.get("receiver").id !== currentUser.id) {
      throw new Error('This user is not the receiver of the request!');
    }

  
    if (action === 'accept') {
      request.set("status", "accepted");
      await request.save();

 
      const sender = request.get("sender");

      await addToFriendsList(currentUser, sender);
      await addToFriendsList(sender, currentUser);

      console.log(`Sender: ${sender.get('username')}, Receiver: ${currentUser.get('username')}`);
      console.log("Friend request accepted and users added to friends list.");
    } 

    else if (action === 'deny') {
      request.set("status", "denied");
      await request.save();
      console.log("Friend request denied.");
    }
  } catch (error) {
    console.error('Error handling friend request:', error);
  }
};


export { 
  getMyConnections, 
  getAllUsers, 
  sendFriendRequest, 
  removeFriend, 
  getPendingRequests, 
  handleFriendRequest 
};


// const handleFriendRequest = async (requestId, action) => {
//   const currentUser = Parse.User.current();

//   if (!currentUser) {
//     console.error('No current user logged in!');
//     return;
//   }

//   try {
//     const query = new Parse.Query("Connection");
//     const request = await query.get(requestId);

//     if (request.get("receiver").id !== currentUser.id) {
//       throw new Error('This user is not the receiver of the request!');
//     }

//     if (action === 'accept') {
 
//       request.set("status", "accepted");
//       await request.save();

  
//       await addToFriendsList(currentUser, request.get("sender"));
//       console.log(`This is the sender ${sender}`)
//       console.log("Friend request accepted and users added to friends list.");
//     } else if (action === 'deny') {
   
//       request.set("status", "denied");
//       await request.save();
//       console.log("Friend request denied.");
//     }
//   } catch (error) {
//     console.error('Error handling friend request:', error);
//   }
// };