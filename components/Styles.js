//This will pass in the properties for similar styling
//To reduce code 
import { StyleSheet, Appearance } from "react-native";

export const determineGlobalStyles = () => {
  let deviceColor = Appearance.getColorScheme();
// let deviceColor = 'dark'

  const colorPalette = {
    light: {
      background: '#A1C6EA',
      text: '#000',
      buttonBackground: '#fff',
      buttonText: '#075985',
      border: '#0ea5e9',
      inputBackground: '#fff',
      inputText: '#000',
      placeholderTextColor: '#888',
      drawerBackground: '#fff',
      drawerIconColor: '#000',
      drawerLabelColor: '#000',
    },
    dark: {
      background: '#04080F',
      text: '#fff',
      buttonBackground: '#075985',
      buttonText: '#fff',
      border: '#155e75',
      inputBackground: '#1c1c1c',
      inputText: '#fff',
      placeholderTextColor: '#bbb', 
      drawerBackground: '#1c1c1c',
      drawerIconColor: '#fff',
      drawerLabelColor: '#fff',
    },
  };

  const colors = deviceColor === 'dark' ? colorPalette.dark : colorPalette.light;
    // const colors = colorPalette.dark
  
  const determinedLogo = deviceColor === 'dark'
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
      borderColor: colors.border,
      backgroundColor: colors.buttonBackground,
    },
    bigButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.buttonText,
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
      }
      
  });

  return { styles, determinedLogo };
};
