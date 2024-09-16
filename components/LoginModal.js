//This will be the login modal with the option to return to the Welcome Screen
import React, { useState, useContext } from 'react';
import { View, TextInput, ActivityIndicator, Alert, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { determineGlobalStyles } from '../components/Styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthContext } from '../context/AuthContext'; 

const LoginScreen = () => {
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { styles, determinedLogo } = determineGlobalStyles();
  const { login } = useContext(AuthContext); 

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(username, password); 
      setLoading(false);
      Alert.alert("Success!", "You are logged in successfully.");
      setTimeout(() => {
        navigation.navigate('Main');
      }, 500);
    } catch (error) {
      setLoading(false);
      Alert.alert("Login Failed", error.message, [{ text: "OK" }]);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Image source={determinedLogo} style={styles.logo} />
      
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
