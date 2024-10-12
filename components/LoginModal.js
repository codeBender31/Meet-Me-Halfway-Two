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
import Parse from 'parse/react-native.js';
//Import validation libaries
import {Formik} from 'formik';
import * as Yup from 'yup';

//This will be schema for the login page
const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Valid username is required'),
  password: Yup.string().required('Valid password is required')
})

const LoginScreen = () => {
  //Designated as let to allow different users to log in/out in the same session
  // let [username, setUsername] = useState('');
  // let [password, setPassword] = useState('');
  //Set the loading icon state 
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  //Inherit the styling from Styles.js
  const { styles, determinedLogo } = determineGlobalStyles();
  const { login } = useContext(AuthContext); 
//Async method to login the user, establish object id and session
  const handleLogin = async (values) => {
    //Separate the new values
    const {username, password} = values;
    //Start loading 
    setLoading(true);
    try {
      const loggedInUser = await Parse.User.logIn(username, password);
      setLoading(false);
      //This will serve as a double check for logging in
      Alert.alert("Success!", "You are logged in successfully.");
      //Set a delay to showcase the loading icon 
      setTimeout(() => {
        navigation.navigate('Main');
      }, 500);
    } catch (error) {
      //End loading
      setLoading(false);
      Alert.alert("Login Failed", error.message, [{ text: "OK" }]);
    }
  };

  return (
    //To hide the keyboard as we move down the page 
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      {/*This will help determine what logo needs to be used depending on the color mode */}
      <Image source={determinedLogo} style={styles.logo} /> 
      {/*All the necessary fields to make the unique user objects */}
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
          <View style={{ width: '100%' }}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={values.username}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              autoCapitalize="none"
              placeholderTextColor={styles.inputPlaceholderTextColor}
            />
            {touched.username && errors.username && <Text style={styles.error}>{errors.username}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              placeholderTextColor={styles.inputPlaceholderTextColor}
            />
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <TouchableOpacity
                style={[
                  styles.bigButton,
                  !(isValid && dirty) && styles.disabledButton, 
                ]}
                onPress={handleSubmit}
                disabled={!(isValid && dirty)} 
              >
                <Text style={!(isValid && dirty) ? styles.disabledButtonText : styles.bigButtonText}>
                  Login
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default LoginScreen;
