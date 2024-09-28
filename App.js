import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-get-random-values';
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './context/AuthContext'; 
import { determineGlobalStyles } from './components/Styles';
//Import necessary screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoadingScreen from './screens/LoadingScreen';
import RegisterModal from './components/RegisterModal';
import LoginModal from './components/LoginModal';
import Dashboard from './screens/DashboardScreen';
//Import the side menu components
import NotificationsModal from './components/NotificationsModal'
import ConnectionsScreen from './screens/ConnectionsScreen'
import SettingsModal from './components/SettingsModal'
import AboutUsModal from './components/AboutUsModal'
import SideMenu from './components/SideMenu'
import MidwayGuest from './screens/MidwayGuest'
import ScheduledMeetings from './components/ScheduledMeetings';


// Initialize Parse SDK before any other operations
Parse.setAsyncStorage(AsyncStorage);
//Parse Application key and Javascript key 
Parse.initialize('sNnxFWRF0ubJiUIjSXyx115133iIj0qvVtOA1kmr', '2GhwuMQUwlTxWKyi2TBBMqvGdapMZkzqlxafjCeL');
Parse.serverURL = 'https://parseapi.back4app.com/';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const { styles } = determineGlobalStyles(); 

  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideMenu {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0ea5e9',  

        },
        headerTintColor: styles.loadingText.color,  
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 30,
          paddingBottom: 20,

        },
        drawerStyle: {
          backgroundColor: styles.container.backgroundColorTopNav,  
          width: 240,
        },
        drawerActiveTintColor: styles.bigButtonText.color, 
        drawerInactiveTintColor: styles.loadingText.color,  
        drawerLabelStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Notifications" component={NotificationsModal} />
      <Drawer.Screen name="Meetings" component={ScheduledMeetings}/>
      <Drawer.Screen name="Connections" component={ConnectionsScreen} />
      <Drawer.Screen name="Settings" component={SettingsModal} />
      <Drawer.Screen name="AboutUs" component={AboutUsModal} />
    </Drawer.Navigator>
  );
}

function App() {
  const { styles } = determineGlobalStyles();
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="LoadingScreen"
          screenOptions={{
            headerStyle: {
              backgroundColor: styles.container.backgroundColor,  
            },
            headerTintColor: styles.loadingText.color,  
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Sign Up" component={RegisterModal} />
          <Stack.Screen name="Login" component={LoginModal} />
          <Stack.Screen name="MidwayGuest" component={MidwayGuest} />
          <Stack.Screen name="Main" component={DrawerNavigator} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
