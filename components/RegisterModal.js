import React, { useState, useContext } from 'react';
import { View, TextInput, ActivityIndicator, Image, TouchableOpacity, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { determineGlobalStyles } from '../components/Styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

//Import the form validation
import {Formik} from 'formik';
import * as Yup from 'yup';
//Import the user class 

import User from '../models/User';
import Parse from 'parse/react-native.js';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

//Input validation schema
const RegistrationSchema = Yup.object().shape({
  firstName: Yup.string().required('Please make sure to provide your first name.'),
  lastName: Yup.string().required('Please provide your last name.'),
  email: Yup.string().email('Invalid email').required('Email is required.'),
  phoneNumber: Yup.string().required('Phone number is required'),
  username: Yup.string().required('Please provide a username'),
  password: Yup.string().min(6, 'Remember password must be at least 6 characters long.').required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Please double check that your passwords match.').required('Confirm password is also required'),
})

const RegisterScreen = () => {

  const [loading, setLoading] = useState(false); 
  const navigation = useNavigation();
  const { styles, determinedLogo } = determineGlobalStyles();
  const { login } = useContext(AuthContext); 

  const checkIfUserExists = async (username, email) => {


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

//If the user is not register then go ahead an register them and create a new user object 
  const handleRegister = async (values) => {
    const { firstName, lastName, phoneNumber, username, password, email } = values;

    // if (!validateForm()) return;


    setLoading(true); 

    if (await checkIfUserExists(username, email)) {
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

      {/*Here we set all the components for the input fields to make User objects */}
      <Formik
       initialValues={{
       firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      username: '',
      password: '',
      confirmPassword: '',
  }}
  validationSchema={RegistrationSchema}
  //Pass in all values to handle register
  onSubmit={handleRegister}
>
  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
    <View style={{ width: '100%' }}>

      <TextInput
        placeholder="First Name"
        style={styles.input}
        onChangeText={handleChange('firstName')}
        onBlur={handleBlur('firstName')}
        value={values.firstName}
      />
      {touched.firstName && errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

      <TextInput
        placeholder="Last Name"
        style={styles.input}
        onChangeText={handleChange('lastName')}
        onBlur={handleBlur('lastName')}
        value={values.lastName}
      />

      {touched.lastName && errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

      <TextInput

        placeholder="Phone #"
        style={styles.input}

        keyboardType="phone-pad"
        onChangeText={handleChange('phoneNumber')}
        onBlur={handleBlur('phoneNumber')}
        value={values.phoneNumber}
      />
      {touched.phoneNumber && errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}

      <TextInput

        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={handleChange('email')}
        onBlur={handleBlur('email')}
        value={values.email}
      />
      {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        placeholder="Username"
        style={styles.input}
        onChangeText={handleChange('username')}
        onBlur={handleBlur('username')}
        value={values.username}
      />
      {touched.username && errors.username && <Text style={styles.error}>{errors.username}</Text>}

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        onChangeText={handleChange('password')}
        onBlur={handleBlur('password')}
        value={values.password}
      />
      {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        placeholder="Confirm Password"
        style={styles.input}
        secureTextEntry
        onChangeText={handleChange('confirmPassword')}
        onBlur={handleBlur('confirmPassword')}
        value={values.confirmPassword}
      />
      {touched.confirmPassword && errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}



      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <TouchableOpacity
        style={[
          styles.bigButton,
          !(isValid && dirty) && styles.disabledButton,  // Apply disabled style if button is disabled
        ]}
        onPress={handleSubmit}
        disabled={!(isValid && dirty)}  // Disable the button if the form is invalid or not dirty
      >
        <Text style={!(isValid && dirty) ? styles.disabledButtonText : styles.bigButtonText}>
          Submit
        </Text>
      </TouchableOpacity>
      )}
    </View>
  )}
</Formik>
    </KeyboardAwareScrollView>
  );
};

export default RegisterScreen;
