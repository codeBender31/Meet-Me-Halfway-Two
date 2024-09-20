import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, ScrollView, StyleSheet } from 'react-native';

const SettingsScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFont, setSelectedFont] = useState('Default');

  const languages = ['English', 'Spanish', 'French'];
  const fonts = ['Default', 'Serif', 'Sans-serif', 'Monospace'];

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleNotifications = () => setIsNotificationsEnabled(!isNotificationsEnabled);
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>General Settings</Text>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Notifications</Text>
        <Switch value={isNotificationsEnabled} onValueChange={toggleNotifications} />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Share Location</Text>
        <Switch value={isLocationEnabled} onValueChange={toggleLocation} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
      </View>

      {/* Change Username */}
      <View style={styles.settingItemColumn}>
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
        <TouchableOpacity style={styles.submitButton} onPress={handleEmailSubmit}>
          <Text style={styles.submitButtonText}>Submit Email</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>App Version</Text>
        <Text style={styles.versionText}>1.0.0</Text>
      </View>
    </ScrollView>
  );
};

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
