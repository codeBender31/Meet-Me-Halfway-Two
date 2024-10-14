import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

//Obtain the width of the device to properly display the animation
const { width } = Dimensions.get('window');

//Definition of the animation for the starting text
const TextAnimation = () => {
    //Defining array that will hold word options 
  const wordsArray = ['selling', 'meeting', 'trading', 'eating', 'shopping', 'study'];
  //Defining the array that will hold the colors to will map to each word 
  const colorsArray = [
    '#ff6f61', '#6b5b95', '#feb236', 
  '#45b8ac', '#92a8d1', '#955251',
   
  ]; 
//   '#d64161',  '#88b04b', '#b565a7', '#009b77', '#dd4124',  '#f7cac9', 
//Keep track of the current word with the current word index
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
//Effect hook to iterate through the word array
  useEffect(() => {
    const interval = setInterval(() => {
        //Change between the words every 1.5 seconds
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % wordsArray.length);
    }, 1500);
//Clear the interval once it is finished so it can restart
    return () => clearInterval(interval);
  }, []);
  //Return the components that will be animated 
  return (
    <View style={styles.container}>
        
      <Animatable.View
        animation="flipInY" //This will determine what type of animation we want to use 
        iterationCount="infinite" //Use it infinitely 
        duration={5000} //Durantion for animation
        style={styles.backgroundAnimation}
      />

      
      <Text style={styles.title}>
        Find the perfect{' '}<Animatable.Text
  key={currentWordIndex} //Retrigger animation with new target from array 
  animation="flipInY" //Type of animation
  duration={1500} //Duration of animation
  easing="ease-in-out" //To enhance visual transition
  iterationCount={1}//Only execute once per element change
  style={[
    styles.title,
    styles.offset4,
    styles.highlightedWord,
    { color: colorsArray[currentWordIndex] },
  ]}
>
  {wordsArray[currentWordIndex]}
</Animatable.Text>{' '}
        spot
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingVertical: 20, 
    marginVertical: 40, 
    justifyContent: 'center',
    alignItems: 'center',
    background: '#DAE3E5',
  },
  title: {
    fontSize: 27,
    textAlign: 'center',
    fontWeight: '600',
  },
  highlightedWord: {
    fontWeight: 'bold',
  },
  backgroundAnimation: {
    position: 'absolute',
    width: width,
    height: '100%',
    background: '#DAE3E5',
    borderRadius: 20,
  },
});

export default TextAnimation;
