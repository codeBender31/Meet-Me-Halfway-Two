//This will keep track of which user is logged in and not require logging in until they specify
import React, { createContext, useState, useEffect } from 'react';
import Parse from 'parse/react-native.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await Parse.User.currentAsync();
        console.log(`This is the current user from AuthContext: ${currentUser}`);
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Failed to get current user", error);
      }
    };

    checkUser();
  }, []);

  const login = async (username, password) => {
    try {
      const loggedInUser = await Parse.User.logIn(username, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Failed to log in", error);
      return null;
    }
  };

  const logout = async () => {
    await Parse.User.logOut();
    setUser(null);
    await AsyncStorage.removeItem('sessionToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
