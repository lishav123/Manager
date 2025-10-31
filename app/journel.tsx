import { View, Text, StyleSheet } from "react-native";

export default function JournelPage() {
  return <View style={ styles.root }>
    <Text>This is the JournelPage</Text>
  </View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});