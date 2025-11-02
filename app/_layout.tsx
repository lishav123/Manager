import { Tabs } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // You can set a global active/inactive tint color here if you like
        tabBarActiveTintColor: '#79def7',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: 'teal',
          paddingTop: 10,
          height: 120,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="home-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Skills",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="school-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="money"
        options={{
          title: "Money",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="wallet-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: "Streak",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="flame-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journel" // Note: This file name should be 'journal.jsx' to match
        options={{
          title: "Journal", // I corrected the spelling of 'Journal' here
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="journal-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
