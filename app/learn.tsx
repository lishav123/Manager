import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const dummy_data = [
  {
    id: 0,
    name: "section 0",
    data: [
      {id: 0, task: "task 1", isdone: false},
      {id: 1, task: "task 2", isdone: true},
      {id: 2, task: "task 3", isdone: false},
      {id: 3, task: "task 4", isdone: true},
      {id: 4, task: "task 5", isdone: false},
    ],
  },
  {
    id: 1,
    name: "section 1",
    data: [
      {id: 0, task: "task 1", isdone: true},
      {id: 1, task: "task 2", isdone: false},
      {id: 2, task: "task 3", isdone: true},
      {id: 3, task: "task 4", isdone: true},
      {id: 4, task: "task 5", isdone: false},
    ],
  },
  {
    id: 2,
    name: "section 2",
    data:[
      {id: 0, task: "task 1", isdone: false},
      {id: 1, task: "task 2", isdone: false},
      {id: 2, task: "task 3", isdone: false},
      {id: 3, task: "task 4", isdone: false},
      {id: 4, task: "task 5", isdone: false},
    ],
  },
  {
    id: 3,
    name: "section 3",
    data: [
      {id: 0, task: "task 1", isdone: true},
      {id: 1, task: "task 2", isdone: true},
      {id: 2, task: "task 3", isdone: true},
      {id: 3, task: "task 4", isdone: true},
      {id: 4, task: "task 5", isdone: true},
    ],
  },
  {
    id: 4,
    name: "section 4",
    data: [
      {id: 0, task: "task 1", isdone: false},
      {id: 1, task: "task 2", isdone: false},
      {id: 2, task: "task 3", isdone: false},
      {id: 3, task: "task 4", isdone: false},
      {id: 4, task: "task 5", isdone: false},
    ],
  },
]

const TaskCard = ({ idx, task, isdone }) => {
  return <View style={{ backgroundColor: idx % 2 == 0 ? "#B2D8D8" : "#66B2B2", padding: 10}}>
    <Text>{task} {idx}</Text>  
  </View>
}

const TabsSubSectionElements = ({ data }) => {
  return <FlatList 
    data={data}
    renderItem={({ item }) => <TaskCard task={item.task} isdone={item.isdone} idx={data.indexOf(item)} />}
    keyExtractor={item => item.id}
  />
}

const TabSection = ({ data }) => {
  return <FlatList 
    data={data}
    renderItem={({ item }) => (
          <View>  
            <Pressable style={ styles.section }>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>{ item.name[0].toUpperCase() + item.name.substring(1) }</Text>
              <View style={{ flexDirection: "row", backgroundColor: "teal", borderRadius: 5, padding: 10, alignItems: "center"}}>
                <Ionicons name={"add"} size={15} color={"white"}/>
                <Text style={{ color: "white", marginLeft: 10}}>Add Skill</Text>
              </View>  
            </Pressable>
            <TabsSubSectionElements data={item.data} />
          </View>  
      )
    }
    keyExtractor={item => item.id}
  />
}

export default function LearnPage() {

  const [data, setData] = useState(dummy_data);

  const handleSection = () => {
    let id = data[data.length - 1].id + 1;
    setData([...data, {
      id: id,
      name: `Section ${id}`,
      data: [
        {id: 0, task: "task 1", isdone: false},
        {id: 1, task: "task 2", isdone: true},
        {id: 2, task: "task 3", isdone: false},
        {id: 3, task: "task 4", isdone: true},
        {id: 4, task: "task 5", isdone: false},
      ]
    }]);
  }

  return <SafeAreaView style={ styles.root }>
    {/*<SummarySection data={dummy_data}>*/}
    <Pressable style={ styles.addSection } onPress={handleSection}>
      <Ionicons name={"add-circle"} color={"white"} size={25}/>
      <Text style={ styles.lightText }>Add a new Section</Text>
      <Text></Text>
    </Pressable>
    <TabSection data={data} />
  </SafeAreaView>
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },

  addSection: {
    flexDirection: "row",
    backgroundColor: "black",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between"
  },

  lightText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold"
  },

  section: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "teal",
    paddingVertical: 10,
    marginTop: 2
  },
});