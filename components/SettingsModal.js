//This will be the settings modal for dark mode, notifications, profile pic, etc.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, StyleSheet } from 'react-native';

const SettingsScreen = () => {
  //Set the states that will be controlled in the page 
  //They are only placeholders for now 
  const [isDarkMode, setIsDarkMode] = useState(false);
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

//Create the dark mode/light mode toggle
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
//Create the notifications toggle 
  const toggleNotifications = () => setIsNotificationsEnabled(!isNotificationsEnabled);
//Create the toggle for the location 
  const toggleLocation = () => setIsLocationEnabled(!isLocationEnabled);

  return (
    <View style={styles.container}>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
        {/*Declare the switch for the light/dark mode */}
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
        />
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
          placeholder="New Username"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Change Email</Text>
        <TextInput
          style={styles.input}
          placeholder="New Email"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.settingItem}>
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
      </View>

      <View style={styles.settingItem}>
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
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>App Version</Text>
        {/*Since this is a second version*/}
        <Text style={styles.versionText}>2.0.0</Text>
      </View>
    </View>
  );
};
//Temporary styling 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 18,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  languageButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#007BFF',
  },
  languageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 16,
    color: '#777',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
});

export default SettingsScreen;
