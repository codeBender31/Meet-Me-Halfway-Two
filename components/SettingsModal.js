//This will be the settings modal for dark mode, notifications, profile pic, etc.
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, StyleSheet, ScrollView, Alert, Image, Button, ActivityIndicator} from 'react-native';
import {AuthContext} from '../context/AuthContext'
import { determineGlobalStyles } from './Styles';
import User from '../models/User'
// import { launchImageLibrary } from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import Parse from 'parse/react-native.js';


const SettingsScreen = () => {
  //Set the states that will be controlled in the page 
  //They are only placeholders for now 
  // const [darkMode, setDarkMode] = useState(false);
  let {darkMode, toggleDarkMode} = useContext(AuthContext);
  const {styles} = determineGlobalStyles(darkMode);

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
//Here are the fields that users will be able to change in their settings page 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFont, setSelectedFont] = useState('Default');
  const languages = ['English', 'Spanish', 'French'];
  const fonts = ['Default', 'Serif', 'Sans-serif', 'Monospace'];

// //Create the dark mode/light mode toggle
//   const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
//Create the notifications toggle 
  const toggleNotifications = () => setIsNotificationsEnabled(!isNotificationsEnabled);
//Create the toggle for the location 
  const toggleLocation = () => setIsLocationEnabled(!isLocationEnabled);

  const [profileImage, setProfileImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);


  //Helper function to change username
    const handleChangeUsername = () => {
      Alert.prompt(
        'Change Username',
        `Current username: ${username}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: (newUsername) => {
              if (newUsername) {
                setUsername(newUsername);
              }
            },
          },
        ],
        'plain-text'
      );
    };

     // Function to change email
  const handleChangeEmail = () => {
    Alert.prompt(
      'Change Email',
      `Current email: ${email}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (newEmail) => {
            if (newEmail) {
              setEmail(newEmail);
            }
          },
        },
      ],
      'plain-text'
    );
  };

    // Function to change password
    const handleChangePassword = () => {
      Alert.prompt(
        'Verify Old Password',
        'Enter your current password',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Verify',
            onPress: (oldPassword) => {
              if (oldPassword === password) {
                Alert.prompt(
                  'Change Password',
                  'Enter your new password',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: (newPassword) => {
                        if (newPassword) {
                          setPassword(newPassword);
                        }
                      },
                    },
                  ],
                  'secure-text'
                );
              } else {
                Alert.alert('Incorrect Password', 'The old password you entered is incorrect.');
              }
            },
          },
        ],
        'secure-text'
      );
    };

    const handleChoosePhoto = async () => {
      try {
        // Request permission to access the media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (!permissionResult.granted) {
          Alert.alert("Permission Denied", "You need to allow permissions to access the gallery!");
          return;
        }
    
        // Launch the image picker
        const response = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
    
        // Log the full response to understand its structure
        console.log('ImagePicker response:', response);
    
        // If the user didn't cancel the selection, proceed
        if (!response.canceled && response.assets && response.assets.length > 0) {
          const asset = response.assets[0]; // Get the first selected asset
          if (asset.uri) {
            const file = {
              uri: asset.uri,
              type: asset.mimeType ? asset.mimeType : 'image/jpeg', // Use mimeType from the asset if available
              name: asset.fileName ? asset.fileName : asset.uri.split('/').pop(), // Use fileName if available
            };
            uploadProfilePicture(file);
          } else {
            console.error('Image URI is undefined.');
          }
        } else {
          console.log('User cancelled image selection or no assets found.');
        }
      } catch (error) {
        console.error('Error in handleChoosePhoto:', error);
        Alert.alert('Error', 'Something went wrong while selecting the image.');
      }
    };
    
  
    const uploadProfilePicture = async (file) => {
      try {
        setLoadingImage(true); // Start loading
  
        // Get the currently logged-in user
        const currentUser = Parse.User.current();
        if (!currentUser) {
          throw new Error('No user is currently logged in.');
        }
  
        // Create a Parse File with the uploaded image
        const parseFile = new Parse.File(file.name, file);
  
        // Set the profile picture in the currentUser object
        currentUser.set("profilePicture", parseFile);
  
        // Save the updated user object
        await currentUser.save();
        setProfileImage(file.uri);
        Alert.alert('Success', 'Profile picture uploaded successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload profile picture.');
        console.error('Error uploading profile picture:', error);
      } finally {
        setLoadingImage(false); // End loading
      }
    };

  return (
    // <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style = {styles.scrollContainer}>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
      <Switch
  value={darkMode}
  onValueChange={(value) => {
    toggleDarkMode(value); // Ensure toggleDarkMode gets the new value
    console.log('Switch toggled: ', value); // Debugging output to ensure it's toggling
    }}/>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Notifications</Text>
           {/*Declare the switch for the notifications */}
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Share Location</Text>
           {/*Declare the switch for the locations preference */}
        <Switch
          value={isLocationEnabled}
          onValueChange={toggleLocation}
        />
      </View>
             
      {/*For security purposes these cannot be this simple*/}
      {/*We need to set security measures for them */}

      <View style={styles.settingItem}>
        {/* <Text style={styles.settingText}>Change Username</Text> */}
        <TouchableOpacity onPress={handleChangeUsername} style={styles.bigButton}>
          <Text style={styles.bigButtonText}>Change Username</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.settingItem}>
        <Text style={styles.settingText}>Change Username</Text>
        <TextInput
          style={styles.input}
          placeholder="New Username"
          value={username}
          onChangeText={setUsername}
        />
      </View> */}
       <View style={styles.settingItem}>
        {/* <Text style={styles.settingText}>Change Username</Text> */}
        <TouchableOpacity onPress={handleChangePassword} style={styles.bigButton}>
          <Text style={styles.bigButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.settingItem}>
        <Text style={styles.settingText}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
      </View> */}

      <View style={styles.settingItem}>
        {/* <Text style={styles.settingText}>Change Username</Text> */}
        <TouchableOpacity onPress={handleChangeEmail} style={styles.bigButton}>
          <Text style={styles.bigButtonText}>Change Email</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.settingItem}>
        <Text style={styles.settingText}>Change Email</Text>
        <TextInput
          style={styles.input}
          placeholder="New Email"
          value={email}
          onChangeText={setEmail}
        />
      </View> */}
   
   <View style={styles.settingItem}>
        <Button title="Choose Profile Picture" onPress={handleChoosePhoto} />
        {loadingImage ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          profileImage && <Image source={{ uri: profileImage }} style={{ width: 100, height: 100 }} />
        )}
      </View>
      {/* <View style={styles.settingItem}>
        <Text style={styles.settingText}>Font Type</Text>
        <View style={styles.languageSelector}>
          {fonts.map((font) => (
            <TouchableOpacity
              key={font}
              style={[
                styles.languageButton,
                selectedFont === font && styles.activeButton
              ]}
              onPress={() => setSelectedFont(font)}
            >
              <Text style={styles.languageText}>{font}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View> */}

      {/* <View style={styles.settingItem}>
        <Text style={styles.settingText}>Language</Text>
        <View style={styles.languageSelector}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language}
              style={[
                styles.languageButton,
                selectedLanguage === language && styles.activeButton
              ]}
              onPress={() => setSelectedLanguage(language)}
            >
              <Text style={styles.languageText}>{language}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View> */}

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>App Version</Text>
        {/*Since this is a second version*/}
        <Text style={styles.settingText}>2.0.0</Text>
      </View>
      </View>

  );
};


export default SettingsScreen;
