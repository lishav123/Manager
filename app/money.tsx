import { View, Text, StyleSheet } from "react-native";

export default function MoneyPage() {
  return <View style={ styles.root }>
    <Text>This is the MoneyPage</Text>
  </View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});