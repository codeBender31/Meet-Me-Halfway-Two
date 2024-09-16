//This screen is always seen when the app is opened or first launched 
//Here we will check if the user is already registered to restore their session 
//Here we will also check if the current device is in dark or light mode 
import React, { useEffect, useContext } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { determineGlobalStyles } from '../components/Styles';
import { AuthContext } from '../context/AuthContext'; 

export default function LoadingScreen({ navigation }) {
  const { styles, determinedLogo } = determineGlobalStyles();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (user) {
        console.log("User is logged in, navigating to Main.");
        navigation.replace('Main'); 
      } else {
        console.log("No user logged in, navigating to Welcome.");
        navigation.replace('Welcome');
      }
    }, 2000);

    return () => clearTimeout(timeout); 
  }, [user, navigation]);

  return (
    <View style={styles.container}>
      <Image source={determinedLogo} style={styles.logo} />
      <ActivityIndicator size="large" color={styles.activityIndicatorColor} />
    </View>
  );
}
