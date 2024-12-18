//This will keep track of which user is logged in and not require logging in until they specify
import React, { createContext, useState, useEffect } from 'react';
import Parse from 'parse/react-native.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
//Variable to keep track of state
export const AuthContext = createContext();
//Pass in the state to all the children pages
export const AuthProvider = ({ children }) => {
//Set the state to null since we assume no user is logged in 
  const [user, setUser] = useState(null);
//Determine if dark mode is activated and set the state, assume it isnt 
const[darkMode, setDarkMode] = useState(false);
//Chek what user is logged in and log it to the console. 
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await Parse.User.currentAsync();
        //Need to remove this once all debugging and testing is complete 
        // console.log(`This is the current user from AuthContext: ${currentUser}`);
        if (currentUser) {
          setUser(currentUser);
          const darkModeIsEnabled = currentUser.get('darkModeEnabled');
          // console.log(`The current dark mode is: ${darkModeIsEnabled}`)
          setDarkMode(darkModeIsEnabled);

        }
      } catch (error) {
        console.error("Failed to get current user", error);
      }
    };

    checkUser();
  }, []);
//Login method to peek at who is logging in 

  const login = async (username, password) => {
    try {
      const loggedInUser = await Parse.User.logIn(username, password);
      setUser(loggedInUser);
      const darkModeIsEnabled = loggedInUser.get('darkModeEnabled');
      setDarkMode(darkModeIsEnabled);
      return loggedInUser;
    } catch (error) {
      console.error("Failed to log in", error);
      return null;
    }
  };

//Logout to keep track of when the user logged out 
  const logout = async () => {
    await Parse.User.logOut();
    setUser(null);
    await AsyncStorage.removeItem('sessionToken');
  };

  const toggleDarkMode = async (enabled) => {
    setDarkMode(enabled);
    // console.log(enabled);
    if (user) {
      //If the toggle in the settings page is turned on 
      user.set('darkModeEnabled', enabled); 
      await user.save(); 
    }
  };
//Return the state and pass it to the other pages (children)
  return (
    <AuthContext.Provider value={{ user, login, logout, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};
