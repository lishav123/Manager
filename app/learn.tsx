import { View, Text, FlatList, StyleSheet, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

let dummy_data = [
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
  return <View style={{ backgroundColor: idx % 2 == 0 ? "#B2D8D8" : "#66B2B2", padding: 10, justifyContent: "space-between", flexDirection: "row", alignItems: "center"}}>
    <Text style={{ fontSize: 15, marginLeft: 10, fontWeight: "bold", color: "teal", textDecorationLine: isdone ? 'line-through' : undefined}}>{task}</Text>
    <Pressable style={{ backgroundColor: isdone ? "green": "#41A67E", borderRadius: 5, padding: 5, width: 75, justifyContent: "center", alignItems: "center" }}>
      <Text style={{color: "white", fontWeight: "bold"}}>
        { isdone ? "Undone" : "Done" }
      </Text></Pressable>
  </View>
}

const TabsSubSectionElements = ({ data }) => {
  return <FlatList 
    data={data}
    renderItem={({ item }) => <TaskCard task={item.task} isdone={item.isdone} idx={data.indexOf(item)} />}
    keyExtractor={item => item.id}
  />
}

const TabSection = ({ data, setData }) => {
  return <FlatList 
    data={data}
    renderItem={({ item }) => (
          <View>  
            <View style={ styles.section }>            
              <View style={{ flexDirection: "row", alignItems: "center"}}>
                <Pressable onPress={() => {
                  setData(() => data.map((m_item) => {
                    if (m_item.id == item.id) {
                      m_item.hidden = !m_item.hidden
                    }
                    return m_item
                  }))
                }}>
                  <Ionicons name={ item.hidden ? "eye-off-outline" : "eye-outline"} size={20} />
                </Pressable>
                <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 15 }}>{ item.name[0].toUpperCase() + item.name.substring(1) }</Text>

              </View>

              <View style={{ flexDirection: "row", alignItems:"center"}}>
                <Pressable style={{ flexDirection: "row", backgroundColor: "teal", borderRadius: 5, padding: 10, alignItems: "center", marginRight: 10}}>
                  <Ionicons onPress={() => alert("Hello")} name={"add"} size={15} color={"white"}/>
                  <Text style={{ color: "white", marginLeft: 10}}>Add Skill</Text>
                </Pressable>
                <Pressable onPress={() => {
                  Alert.alert(
                    'Delete Section',
                    'Are you sure you want to proceed?',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => {},
                      },
                      {
                       text: 'OK',
                       onPress: () => setData(data => data.filter(mdata => mdata.id != item.id)),
                      },
                    ],
                    { cancelable: false }
                  )
                }}>
                  <Ionicons name={"trash-outline"} size={25} color={"red"} />                    
                </Pressable>
              </View>
            </View>
            { item.hidden ?  <></> : <TabsSubSectionElements data={item.data} />}
          </View>  
      )
    }
    keyExtractor={item => item.id}
  />
}

export default function LearnPage() {

  useEffect(() => {
    dummy_data = dummy_data.map((item) => item.hidden = true)
  }, [])

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
      ],
      hidden: true
    }]);
  }

  return <SafeAreaView style={ styles.root }>
    {/*<SummarySection data={dummy_data}>*/}
    <Pressable style={ styles.addSection } onPress={handleSection}>
      <Ionicons name={"add-circle"} color={"white"} size={25}/>
      <Text style={ styles.lightText }>Add a new Section</Text>
      <Text></Text>
    </Pressable>
    <TabSection data={data} setData={setData}/>
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