//This will be the About us Page
//Necessary imports 
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { determineGlobalStyles } from './Styles';

function AboutUsModal({ navigation }) {
  //Inherit the styling from Styles.js
  let { styles, determinedLogo } = determineGlobalStyles();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={determinedLogo} style={styles.logo} />

      <View>
        <Text style={styles.screenText}>Welcome to Meet Me Halfway</Text>
      </View>

      <View>
        <Text style={styles.screenText}>Our Mission</Text>
        <Text style={styles.screenText}>
          Our mission is to promote empathy, dialogue, and collaboration across divides.
          We strive to create spaces where individuals can come together, share their stories, and find common ground.
        </Text>
      </View>

      <View>
        <Text style={styles.screenText}>Inspiration Behind the Project</Text>
        <Text style={styles.screenText}>
          The idea for Meet Me Halfway emerged from our experiences witnessing the transformative impact of genuine conversation.
          We saw how powerful it can be when people meet each other halfway, with openness and respect.
        </Text>
      </View>

      <View>
        <Text style={styles.screenText}>Our Goals</Text>
        <Text style={styles.screenText}>
          - Encourage empathy and understanding.{"\n"}
          - Foster dialogue and collaboration.{"\n"}
          - Break down barriers that divide us.
        </Text>
      </View>

      <View>
        <Text style={styles.screenText}>Meet the Team</Text>
        <View>
          <Text style={styles.screenText}>Hasti Rathod</Text>
          <Text style={styles.screenText}>Sabrina Salazar</Text>
          <Text style={styles.screenText}>Abel Hernandez</Text>
          <Text style={styles.screenText}>Naomi Unuane</Text>
          <Text style={styles.screenText}>Andrew Bradford</Text>
          <Text style={styles.screenText}>Daniel Burgess</Text>
        </View>
      </View>

      <View>
        <Text style={styles.screenText}>Get Involved</Text>
        <Text style={styles.screenText}>
          Join us in our mission to create a more connected world. Whether you want to volunteer your time or support us in other ways, we welcome your participation.

          Contact us at contact@meetmehalfway.com or connect with us on social media.
        </Text>
      </View>
    </ScrollView>
  );
}

export default AboutUsModal;
