//Side Menu components and icons
//Here is where you will add any new pages when users are logged in
import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
//Import the icons for the side menu 
import { Ionicons } from '@expo/vector-icons';
import Parse from 'parse/react-native.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
//Determined styling from Styles.js 
import { determineGlobalStyles } from '../components/Styles'; 

const SideMenu = (props) => {
//Determine if dark or light mode
const {darkMode} = useContext(AuthContext)
//Get the style sheet 
let {styles} = determineGlobalStyles(darkMode)
//Make sure the user is logged in
//Obtain their username 
  const currentUser = Parse.User.current();
  //This is only for testing, will remove later 
  const username = currentUser ? currentUser.getUsername() : 'Guest';
  const navigation = useNavigation();
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
        <Image
          source={{ uri: './assets/icon.png' }} 
          style={localStyles.profileImage}
        />
        <Text style={styles.profileName}>{username}</Text>
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
          <Ionicons name="notifications-outline" size={size} color={styles.drawerIconColor.color} />
        )}
        label="Notifications"
        labelStyle={styles.drawerLabel}
        onPress={() => props.navigation.navigate('Notifications')}
      />
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
    </DrawerContentScrollView>
  );
};
//This styling applies only to the side menu and applies to anything not using global styles 
const localStyles = StyleSheet.create({
  profileSection: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});

export default SideMenu;
