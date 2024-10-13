//This is the screen where the user lands for the first time 
//Or when the user logs out 
import React from 'react';
import { View, Button, StyleSheet, Text, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { determineGlobalStyles } from '../components/Styles';
import Register from '../components/RegisterModal'
import TextAnimation from '../components/TextAnimation';

export default WelcomeScreen = ({ navigation }) => {
    let {styles, determinedLogo} = determineGlobalStyles()
 
  return (
    <View style = {styles.container}>
    <Image source={determinedLogo} style={styles.logo} />
    {/* <Text style={styles.screenText}>Find the perfect meeting spot.</Text> */}
    <TextAnimation/>
      <TouchableOpacity
     style={styles.bigButton}
     onPress={() => navigation.navigate('Login')}>
    <Text style = {styles.bigButtonText}>Login</Text>
     </TouchableOpacity>

      <TouchableOpacity
     style={styles.bigButton}
     onPress={() => navigation.navigate('Sign Up')}>
  <Text style={styles.bigButtonText}>Sign Up</Text>
     </TouchableOpacity>
     
     <TouchableOpacity
     style={styles.bigButton}
     onPress={() => navigation.navigate('MidwayGuest')}>
    <Text style = {styles.bigButtonText}>Try Out Meet Me Halfway</Text>
     </TouchableOpacity>
    </View>
  );
};




