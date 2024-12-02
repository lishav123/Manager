import * as React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HabitManager from './Screen/HabitManager';
import AcademicManager from './Screen/AcademicManager';
import LearningManager from './Screen/LearningManager';
import MoneyManager from './Screen/MoneyManager';

const Stack = createNativeStackNavigator();

// Card Component
const Card = ({ name, imageSource, onPress }) => (
  <Pressable onPress={onPress} style={styles.card}>
    <Image source={imageSource} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardText}>{name}</Text>
    </View>
  </Pressable>
);

// Home Screen
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Card
        name={'Academic Manager'}
        imageSource={require('./assets/academic.jpeg')}
        onPress={() => navigation.navigate('Academic Manager')}
      />
      <Card
        name={'Money Manager'}
        imageSource={require('./assets/money.jpeg')}
        onPress={() => navigation.navigate('Money Manager')}
      />
      <Card
        name={'Learning Manager'}
        imageSource={require('./assets/learning.jpeg')}
        onPress={() => navigation.navigate('Learning Manager')}
      />
      <Card
        name={'Habit Manager'}
        imageSource={require('./assets/habit.jpeg')}
        onPress={() => navigation.navigate('Habit Manager')}
      />
    </View>
  );
}

// App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Academic Manager" component={AcademicManager} />
        <Stack.Screen name="Money Manager" component={MoneyManager} />
        <Stack.Screen name="Learning Manager" component={LearningManager} />
        <Stack.Screen name="Habit Manager" component={HabitManager} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    height: 130,
    borderRadius: 25,
    elevation: 5,
    flexDirection: 'row',
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardImage: {
    width: '40%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center', // Centering vertically
    alignItems: 'center', // Centering horizontally
    paddingHorizontal: 40,
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center', // Centering text inside the Text component
  },
});