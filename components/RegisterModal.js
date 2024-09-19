//This will be register modal pop up when the user is registering with the option to return to the WelcomeScreen
import React, { useState, useContext } from 'react';
import { View, TextInput, ActivityIndicator, Image, TouchableOpacity, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { determineGlobalStyles } from '../components/Styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
//Import the user class 
import User from '../models/User';
import Parse from 'parse/react-native.js';
//Import this to keep track of the logged in user until they choose to log out 
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const RegisterScreen = () => {
  //Declare all the necessary fields to create a User object 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber,setPhoneNumber] = useState('');
  //Declare any errors we may encounter when registering 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); 
  const navigation = useNavigation();
  //Inherit the styling from Styles.js 
  const { styles, determinedLogo } = determineGlobalStyles();
  //Keep track of the user once they register so they wont need to log in again 
  const { login } = useContext(AuthContext); 
//Require all fields to be filled out 
  const validateForm = () => {
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }//Check both password and confirmPassword match 
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };
  //To not let users double register we need to check if they exist in the parse database already 
  const checkIfUserExists = async () => {
    const query = new Parse.Query(Parse.User);
    query.equalTo('username', username);
    query.equalTo('email', email);
  //Throwout appropriate error 
    try {
      const result = await query.first();
      if (result) {
        Alert.alert(
          "Registration Error",
          "User with this username or email already exists",
          [{ text: "OK" }]//Button text from the alert 
        );
        return true;
      }
      return false;
    } catch (err) {
      Alert.alert(
        "Error",
        "Error checking for existing user: " + err.message,
        [{ text: "OK" }]
      );
      return true; 
    }
  };
//If the user is not register then go ahead an register them and create a new user object 
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true); 

    if (await checkIfUserExists()) {
      setLoading(false);
      return;
    }
//Create the new user object 
    const newUser = new User();
    newUser.setFirstName(firstName);
    newUser.setLastName(lastName);
    newUser.setPhoneNumber(phoneNumber);
    newUser.setUsername(username);
    newUser.setPassword(password);
    newUser.setEmail(email);
   
//Attempt to save in the database 
    try {
      await newUser.signUp();
      setLoading(false); 
      const loggedInUser = await login(username, password);
      if (loggedInUser) {
       
        await AsyncStorage.setItem('sessionToken', loggedInUser.getSessionToken());
        setTimeout(() => {//If successful then navigate to Main
          navigation.navigate('Main'); 
        }, 500);
      }
    } catch (err) {//Catch the error otherwise 
      setError(err.message);
      setLoading(false); 
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraHeight={150}
    >
      <Image source={determinedLogo} style={styles.logo} />
      {/*Here we set all the components for the input fields to make User objects */}
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
        style={styles.input}
        autoCapitalize="words"
      />
       <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone #"
        keyboardType="phone-pad"
        style={styles.input}
        // autoCapitalize="none"
      />
        <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        secureTextEntry
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {/*If we are loading then here we set the indicator */}
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        //Button to trigger the register action 
        <TouchableOpacity
          style={styles.bigButton}
          onPress={handleRegister}
        >
          <Text style={styles.bigButtonText}>Submit</Text>
        </TouchableOpacity>
      )}
    </KeyboardAwareScrollView>
  );
};

export default RegisterScreen;
