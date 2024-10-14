
//This will be the settings modal for dark mode, notifications, profile pic, etc.
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, StyleSheet, ScrollView } from 'react-native';
import {AuthContext} from '../context/AuthContext'
import { determineGlobalStyles } from './Styles';


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

  const handleUsernameSubmit = () => {
    console.log('Username updated:', username);
    // Add functionality to submit new username
  };

  const handlePasswordSubmit = () => {
    console.log('Password updated:', password);
    // Add functionality to submit new password
  };

  const handleEmailSubmit = () => {
    console.log('Email updated:', email);
    // Add functionality to submit new email
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
        <Text style={styles.settingText}>Change Username</Text>

        <TextInput
          style={styles.input}
          placeholder="Change Username"
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleUsernameSubmit}>
          <Text style={styles.submitButtonText}>Submit Username</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password */}
      <View style={styles.settingItemColumn}>
        <TextInput
          style={styles.input}
          placeholder="Change Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handlePasswordSubmit}>
          <Text style={styles.submitButtonText}>Submit Password</Text>
        </TouchableOpacity>
      </View>

      {/* Change Email */}
      <View style={styles.settingItemColumn}>
        <TextInput
          style={styles.input}
          placeholder="Change Email"
          value={email}
          onChangeText={setEmail}
        />

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

        <TouchableOpacity style={styles.submitButton} onPress={handleEmailSubmit}>
          <Text style={styles.submitButtonText}>Submit Email</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.settingItem}>
        <Text style={styles.settingText}>App Version</Text>
        {/*Since this is a second version*/}
        <Text style={styles.versionText}>2.0.0</Text>
      </View>

      </View>

  );
};
// //Temporary styling 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f9f9f9',
//   },
//   settingItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   settingText: {
//     fontSize: 18,
//   },
//   languageSelector: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   languageButton: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     marginHorizontal: 5,
//     backgroundColor: '#ddd',
//     borderRadius: 20,
//   },
//   activeButton: {
//     backgroundColor: '#007BFF',
//   },
//   languageText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   versionText: {
//     fontSize: 16,
//     color: '#777',
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     backgroundColor: '#fff',
//   },
// });

    </ScrollView>
  );
};
//Temporary styling 
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  sectionHeader: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingItemColumn: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'column',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  languageSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 5,
    marginBottom: 5,
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#007BFF',
  },
  activeText: {
    color: '#fff',
  },
  languageText: {
    color: '#333',
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 16,
    color: '#777',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default SettingsScreen;
