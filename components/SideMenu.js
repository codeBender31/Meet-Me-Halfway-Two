//Side Menu components and icons
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Parse from 'parse/react-native.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import { determineGlobalStyles } from '../components/Styles'; 

const SideMenu = (props) => {
let {styles} = determineGlobalStyles()
  const currentUser = Parse.User.current();
  const username = currentUser ? currentUser.getUsername() : 'Guest';
  const navigation = useNavigation();

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

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: './assets/icon.png' }} 
          style={localStyles.profileImage}
        />
        <Text style={styles.profileName}>{username}</Text>
      </View>

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
