//This will be the login modal with the option to return to the Welcome Screen
//Necessary components/imports
import React, { useState, useContext } from 'react';
import { View, TextInput, ActivityIndicator, Alert, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { determineGlobalStyles } from '../components/Styles';
//This necessary so the keyboard wont hide the input boxes 
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
//This is key to keep track of who is logged in
import { AuthContext } from '../context/AuthContext'; 

const LoginScreen = () => {
  //Designated as let to allow different users to log in/out in the same session
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  //Set the loading icon state 
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  //Inherit the styling from Styles.js
  const { styles, determinedLogo } = determineGlobalStyles();
  const { login } = useContext(AuthContext); 
//Async method to login the user, establish object id and session
  const handleLogin = async () => {
    // Ensure username and password fields are filled (just to be safe)
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    // Start loading
    setLoading(true);

    try {
      // Call the login function
      const loggedInUser = await login(username, password);
      
      // If user is successfully logged in, proceed
      if (loggedInUser) {
        setLoading(false);
        Alert.alert("Success!", "You are logged in successfully.");
        setTimeout(() => {
          navigation.navigate('Main');
        }, 500);
      }
    } catch (error) {
      // Handle failed login attempt
      setLoading(false);
      Alert.alert("Login Failed", error.message || "An error occurred. Please check your credentials.");
    }
  };


  return (
    //To hide the keyboard as we move down the page 
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      {/*This will help determine what logo needs to be used depending on the color mode */}
      <Image source={determinedLogo} style={styles.logo} /> 
      {/*All the necessary fields to make the unique user objects */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor={styles.inputPlaceholderTextColor}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={styles.inputPlaceholderTextColor}
      />

      {loading ? (
        //This helps us style the loading indicator. 
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity
          style={styles.bigButton}
          onPress={handleLogin}>
          <Text style={styles.bigButtonText}>Login</Text>
        </TouchableOpacity>
      )}
    </KeyboardAwareScrollView>
  );
};

export default LoginScreen;
