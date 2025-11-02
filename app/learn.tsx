import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";


const TaskCard = ({task, isdone}) => {
  return <View>
    <Text>{task}</Text>  
  </View>
}

export default function LearnPage() {
  return <View style={ styles.root }>
    <Text>This is the Learnpage</Text>
  </View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});