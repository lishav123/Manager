import { View, Text, StyleSheet } from "react-native";

export default function StreakPage() {
  return <View style={ styles.root }>
    <Text>This is the Streak</Text>
  </View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});