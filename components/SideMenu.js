//Side Menu components and icons
//Here is where you will add any new pages when users are logged in
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
//Import the icons for the side menu 
import { Ionicons } from '@expo/vector-icons';
import Parse from 'parse/react-native.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import * as Notifications from 'expo-notifications';
//Determined styling from Styles.js 
import { determineGlobalStyles } from '../components/Styles'; 

const SideMenu = (props) => {
//Determine if dark or light mode
const {darkMode} = useContext(AuthContext)
//Get the style sheet 
let {styles, determinedLogo} = determineGlobalStyles(darkMode)
//Make sure the user is logged in
//Obtain their username 
  const currentUser = Parse.User.current();
  //This is only for testing, will remove later 
  const username = currentUser ? currentUser.getUsername() : 'Guest';
  const navigation = useNavigation();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  useEffect(() => {
    const fetchUserProfilePicture = async () => {
      try {
        if (currentUser) {
          // Fetch the current user to get the latest data, including profile picture
          await currentUser.fetch();
  
          const profilePicture = currentUser.get('profilePicture');
          if (profilePicture && profilePicture instanceof Parse.File) {
            setProfilePictureUrl(profilePicture.url());
          } else if (typeof profilePicture === 'string') {
            setProfilePictureUrl(profilePicture);
          } else {
            console.log("Profile picture is not set or is in an unexpected format.");
          }
        }
      } catch (error) {
        console.error('Error fetching user profile picture:', error);
      }
    };
  
    fetchUserProfilePicture();
  }, [currentUser]);
  
  

  // Check for new notifications periodically
  useEffect(() => {
    const checkForNotifications = async () => {
      const query = new Parse.Query('Notifications');
      query.equalTo('receiver', currentUser);
      query.equalTo('status', 'unread');
      const newNotifications = await query.find();
      if (newNotifications.length > 0) {
        setHasNewNotifications(true);
      } else {
        setHasNewNotifications(false);
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(() => {
      checkForNotifications();
    }, 30000);

    // Initial check
    checkForNotifications();

    // Clean up the interval
    return () => clearInterval(interval);
  }, [currentUser]);

  // Listen for push notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setHasNewNotifications(true);
    });

    return () => {
      subscription.remove();
    };
  }, []);
//Once they explicitly log out, show a delay and animation 
  const handleLogout = async () => {
    try {
      await Parse.User.logOut();
      setTimeout(() => {
        navigation.replace('Welcome');
      }, 500);
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.', [{ text: 'OK' }]);
    }
  };

  //Render the page 
  return (
    //Set up the props
    <DrawerContentScrollView {...props}>
      <View style={styles.profileSection}>
        {profilePictureUrl ? (
          <Image source={{ uri: profilePictureUrl }} style={localStyles.profileImage} />
        ) : (
          <Image source={require('../assets/favicon.png')} style={localStyles.profileImage} />
        )}
        <Text style={styles.screenText}>{username}</Text>
      </View>
      {/*Here we declare all components from the side menu */}
      <DrawerItem
        icon={({ color, size }) => (
            <Ionicons name="navigate-outline" size={size} color={styles.drawerIconColor.color} />
        )}
        label="Dashboard"
        labelStyle={styles.drawerLabel}
        onPress={() => props.navigation.navigate('Dashboard')}
      />

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name={hasNewNotifications ? 'notifications' : 'notifications-outline'}
            size={size}
            color={styles.drawerIconColor.color}
          />
        )}
        label="Notifications"
        labelStyle={styles.drawerLabel}
        onPress={() => {
          props.navigation.navigate('Notifications');
          setHasNewNotifications(false); 
        }}
      />

      {/* <DrawerItem
        icon={({ color, size }) => (
          <Ionicons name="notifications-outline" size={size} color={styles.drawerIconColor.color} />
        )}
        label="Notifications"
        labelStyle={styles.drawerLabel}
        onPress={() => props.navigation.navigate('Notifications')}
      /> */}
      <DrawerItem
        icon={({ color, size }) => (
        <Ionicons name="time-outline" size={size} color={styles.drawerIconColor.color} />
  )}
        label="Meetings"
        labelStyle={styles.drawerLabel}
        onPress={() => props.navigation.navigate('Meetings')}  
      />

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons name="people-outline" size={size} color={styles.drawerIconColor.color} />
        )}
        label="Connections"
        labelStyle={styles.drawerLabel}
        onPress={() => props.navigation.navigate('Connections')}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons name="settings-outline" size={size} color={styles.drawerIconColor.color} />
        )}
        label="Settings"
        labelStyle={styles.drawerLabel}
        onPress={() => props.navigation.navigate('Settings')}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons name="information-circle-outline" size={size} color={styles.drawerIconColor.color} />
        )}
        label="About Us"
        labelStyle={styles.drawerLabel}
        onPress={() => props.navigation.navigate('AboutUs')}
      />
      
      <View style={localStyles.separator} />

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons name="exit-outline" size={size} color={styles.drawerIconColor.color} />
        )}
        label="Sign Out"
        labelStyle={styles.drawerLabel}
        onPress={handleLogout}
      />
<Image source={determinedLogo} style={localStyles.logo} /> 
    </DrawerContentScrollView>
  );
};
//This styling applies only to the side menu and applies to anything not using global styles 
const localStyles = StyleSheet.create({
  profileSection: {
    paddingLeft: 40,
    padding: 20,
    alignItems: 'flex-start', 
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: 70,
    // paddingLeft: 20,
  },
  profileName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 60, 
  },
  separator: {
    marginVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 50,
    marginLeft: 20,
  }
});

export default SideMenu;
