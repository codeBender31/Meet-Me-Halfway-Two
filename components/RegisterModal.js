import React, { useState, useContext } from 'react';
import { View, TextInput, ActivityIndicator, Image, TouchableOpacity, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { determineGlobalStyles } from '../components/Styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import User from '../models/User';
import Parse from 'parse/react-native.js';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber,setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); 
  const navigation = useNavigation();
  const { styles, determinedLogo } = determineGlobalStyles();
  const { login } = useContext(AuthContext); 

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10}$/; // Simple validation for 10 digits
    return phoneRegex.test(phoneNumber);
  };

  const validatePasswordStrength = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Phone number must be 10 digits');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!validatePasswordStrength(password)) {
      setError('Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number');
      return false;
    }
    return true;
  };

  const checkIfUserExists = async () => {
    const query = new Parse.Query(Parse.User);
    query.equalTo('username', username);
    query.equalTo('email', email);

    try {
      const result = await query.first();
      if (result) {
        Alert.alert(
          "Registration Error",
          "User with this username or email already exists",
          [{ text: "OK" }]
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

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true); 

    if (await checkIfUserExists()) {
      setLoading(false);
      return;
    }

    const newUser = new User();
    newUser.setFirstName(firstName);
    newUser.setLastName(lastName);
    newUser.setPhoneNumber(phoneNumber);
    newUser.setUsername(username);
    newUser.setPassword(password);
    newUser.setEmail(email);
   
    try {
      await newUser.signUp();
      setLoading(false); 
      const loggedInUser = await login(username, password);
      if (loggedInUser) {
        await AsyncStorage.setItem('sessionToken', loggedInUser.getSessionToken());
        setTimeout(() => {
          navigation.navigate('Main'); 
        }, 500);
      }
    } catch (err) {
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

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
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
