//This will pass in the properties for similar styling
//To reduce code 
import { StyleSheet, Appearance } from "react-native";
import {AuthContext, darkMode} from '../context/AuthContext'
import Parse from 'parse/react-native.js';

export const determineGlobalStyles = (darkMode) => {
  // let deviceColor = Appearance.getColorScheme();
// let deviceColor = 'dark'
// const { darkMode } = useContext(AuthContext);

 
  const colorPalette = {
    light: {

      // background: '#A1C6EA',
      background: '#DAE3E5',

      text: '#000',
      // buttonBackground: '#fff',
      buttonBackground: '#075985',
      buttonText: '#fff',
      // border: '#0ea5e9',
      inputBackground: '#fff',
      inputText: '#000',
      placeholderTextColor: '#888',
      drawerBackground: '#fff',
      drawerIconColor: '#000',
      drawerLabelColor: '#000',
      activityIndicator: '#007BFF',
      meetingItemBackground: '#fff',
      meetingText: '#333',
      borderColor: '#e0e0e0',
      noDataText: '#777',
      sectionTitleColor: '#333',
      sectionBorderColor: '#ccc',
      submitButtonBackground: '#007BFF',
      submitButtonText: '#fff',
      inputBorder: '#ccc',
      versionTextColor: '#777',
      settingItemBorderColor: '#e0e0e0',
      disabledButtonBackground: '#d3d3d3',  // Greyed-out button color
      disabledButtonText: '#aaa',  // Disabled text color
    },
    dark: {
      background: '#04080F',
      text: '#fff',
      buttonBackground: '#075985',
      buttonText: '#fff',
      // border: '#155e75',
      inputBackground: '#1c1c1c',
      inputText: '#fff',
      placeholderTextColor: '#bbb', 
      drawerBackground: '#1c1c1c',
      drawerIconColor: '#fff',
      drawerLabelColor: '#fff',
      activityIndicator: '#fff',
      meetingItemBackground: '#1c1c1c',
      meetingText: '#fff',
      borderColor: '#3a3a3a',
      noDataText: '#bbb',
      sectionTitleColor: '#fff',
      sectionBorderColor: '#555',
      submitButtonBackground: '#0056b3',
      submitButtonText: '#fff',
      inputBorder: '#555',
      versionTextColor: '#bbb',
      settingItemBorderColor: '#555',
      disabledButtonBackground: '#555',  // Dark grey for disabled button
      disabledButtonText: '#888',
    },
  };

  // const colors = deviceColor === 'dark' ? colorPalette.dark : colorPalette.light;
    // const colors = colorPalette.dark
  const colors = darkMode ? colorPalette.dark : colorPalette.light;
  // const colors = colorPalette.dark
  // console.log(`Styles current value ${darkMode}`)

  // const determinedLogo = deviceColor === 'dark'
  const determinedLogo = darkMode === true
    ? require('../assets/DarkModeIcon.png')
    : require('../assets/LightModeIcon.png');

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: colors.background,
      padding: 20,
    },
    logo: {
      width: 300,
      height: 300,
      marginBottom: 15,
      resizeMode: 'contain',
    },
    loadingText: {
      fontSize: 24,
      color: colors.text,
      marginBottom: 20,
    },
    activityIndicator: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bigButton: {
      width: '80%',
      paddingVertical: 12,
      marginVertical: 10,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      // borderColor: colors.border,
      backgroundColor: colors.buttonBackground,
    },
    disabledButton: {
      backgroundColor: colors.disabledButtonBackground,
      borderColor: colors.border,
    },
    bigButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.buttonText,
    },
    disabledButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.disabledButtonText,
    },
    screenText: {
      color: colors.text,
      fontWeight: '500',
      marginTop: 10,
      fontSize: 24,
      textAlign: 'center',
      padding: 25,
    },
    error: {
      color: 'red',
      marginBottom: 12,
    },
    input: {
      height: 50,
      width: '100%',
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 12,
      paddingLeft: 12,
      backgroundColor: colors.inputBackground,
      color: colors.inputText,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
      },

    switchButton: {
      padding: 10,
      backgroundColor: '#ddd',
      borderRadius: 20,
      marginHorizontal: 5,
      minWidth: 150,
      alignItems: 'center',
    },
    activeButton: {
      backgroundColor: '#007BFF',
    },
    switchText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    drawerBackground: {
        backgroundColor: colors.drawerBackground,  
      },
      drawerIconColor: {
        color: colors.drawerIconColor,  
      },
      drawerLabel: {
        color: colors.drawerLabelColor, 
        fontWeight: 'bold',
      },
      separator: {
        marginVertical: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
      },
      list: {
        marginTop: 10,
      },
      text:{
        color: colors.text
      },
      profileName: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text
      },
      largeText:{
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 20,
          color: colors.text
      },
      meetingItem: {
        padding: 15,
        backgroundColor: colors.meetingItemBackground,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.borderColor,
      },
      meetingText: {
        fontSize: 16,
        color: colors.meetingText,
        marginBottom: 5,
      },
      noDataText: {
        color: colors.noDataText,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
      },
    //Settings
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: colors.background,
      // backgroundColor: 'white',
    },
    sectionHeader: {
      marginVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.sectionBorderColor,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingItemColumn: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'column',
    },
    settingText: {
      fontSize: 16,
      color: colors.text,
    },
    languageSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    languageButton: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginHorizontal: 5,
      marginBottom: 5,
      backgroundColor: '#ddd',
      borderRadius: 20,
    },
    activeButton: {
      backgroundColor: colors.buttonBackground,
    },
    activeText: {
      color: colors.buttonText,
    },
    languageText: {
      color: colors.text,
      fontWeight: 'bold',
    },
    versionText: {
      fontSize: 16,
      color: colors.versionText,
    },
    // input: {
    //   borderWidth: 1,
    //   borderColor: colors.border,
    //   width: '100%',
    //   borderRadius: 5,
    //   paddingHorizontal: 10,
    //   paddingVertical: 10,
    //   backgroundColor: colors.inputBackground,
    //   marginTop: 10,
    //   fontSize: 16,
    //   color: colors.inputText,
    // },
    // submitButton: {
    //   backgroundColor: colors.buttonBackground,
    //   paddingVertical: 10,
    //   paddingHorizontal: 15,
    //   borderRadius: 5,
    //   alignItems: 'center',
    //   marginTop: 10,
    // },
    // submitButtonText: {
    //   color: colors.buttonText,
    //   fontSize: 16,
    //   fontWeight: 'bold',
    // },
      
  });

  return { styles, determinedLogo };
};
