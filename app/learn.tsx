import { View, Text, FlatList, StyleSheet, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

/**
 * Dummy dataset representing sections with tasks.
 * Each section contains a list of tasks with completion status.
 */
let dummy_data = [
  {
    id: 0,
    name: "section 0",
    data: [
      { id: 0, task: "task 1", isdone: false },
      { id: 1, task: "task 2", isdone: true },
      { id: 2, task: "task 3", isdone: false },
      { id: 3, task: "task 4", isdone: true },
      { id: 4, task: "task 5", isdone: false },
    ],
  },
  {
    id: 1,
    name: "section 1",
    data: [
      { id: 0, task: "task 1", isdone: true },
      { id: 1, task: "task 2", isdone: false },
      { id: 2, task: "task 3", isdone: true },
      { id: 3, task: "task 4", isdone: true },
      { id: 4, task: "task 5", isdone: false },
    ],
  },
  {
    id: 2,
    name: "section 2",
    data: [
      { id: 0, task: "task 1", isdone: false },
      { id: 1, task: "task 2", isdone: false },
      { id: 2, task: "task 3", isdone: false },
      { id: 3, task: "task 4", isdone: false },
      { id: 4, task: "task 5", isdone: false },
    ],
  },
  {
    id: 3,
    name: "section 3",
    data: [
      { id: 0, task: "task 1", isdone: true },
      { id: 1, task: "task 2", isdone: true },
      { id: 2, task: "task 3", isdone: true },
      { id: 3, task: "task 4", isdone: true },
      { id: 4, task: "task 5", isdone: true },
    ],
  },
  {
    id: 4,
    name: "section 4",
    data: [
      { id: 0, task: "task 1", isdone: false },
      { id: 1, task: "task 2", isdone: false },
      { id: 2, task: "task 3", isdone: false },
      { id: 3, task: "task 4", isdone: false },
      { id: 4, task: "task 5", isdone: false },
    ],
  },
];

/**
 * Renders an individual task card with a button to toggle its completion state.
 */
const TaskCard = ({ idx, task, isdone, data, section_id, setData, whole_data }) => {
  return (
    <View
      style={[
        styles.taskCard,
        { backgroundColor: idx % 2 === 0 ? "#B2D8D8" : "#66B2B2" },
      ]}
    >
      <Text
        style={[
          styles.taskText,
          isdone && { textDecorationLine: "line-through" },
        ]}
      >
        {task}
      </Text>

      {/* Toggle Task Completion Button */}
      <Pressable
        style={[
          styles.taskButton,
          { backgroundColor: isdone ? "green" : "#41A67E" },
        ]}
        onPress={() => {
          // Logic to toggle task status could be added here.
          setData((prev) => []); // Currently just triggers re-render
        }}
      >
        <Text style={styles.buttonText}>{isdone ? "Undone" : "Done"}</Text>
      </Pressable>
    </View>
  );
};

/**
 * Displays a list of task cards within a section.
 */
const TabsSubSectionElements = ({ data, setData, whole_data, section_id }) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <TaskCard
          task={item.task}
          isdone={item.isdone}
          idx={data.indexOf(item)}
          setData={setData}
          data={data}
          section_id={section_id}
          whole_data={whole_data}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

/**
 * Represents a single section that contains a title and its list of tasks.
 * Supports toggling visibility and deleting the section.
 */
const TabSection = ({ data, setData }) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <View>
          {/* Section Header */}
          <View style={styles.section}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Toggle Visibility */}
              <Pressable
                onPress={() =>
                  setData(() =>
                    data.map((m_item) => {
                      if (m_item.id === item.id) {
                        m_item.hidden = !m_item.hidden;
                      }
                      return m_item;
                    })
                  )
                }
              >
                <Ionicons
                  name={item.hidden ? "eye-off-outline" : "eye-outline"}
                  size={20}
                />
              </Pressable>

              {/* Section Title */}
              <Text style={styles.sectionTitle}>
                {item.name[0].toUpperCase() + item.name.substring(1)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {/* Add Skill Button */}
              <Pressable style={styles.addSkillButton}>
                <Ionicons
                  onPress={() => alert("Add Skill Clicked")}
                  name={"add"}
                  size={15}
                  color={"white"}
                />
                <Text style={styles.addSkillText}>Add Skill</Text>
              </Pressable>

              {/* Delete Section */}
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Delete Section",
                    "Are you sure you want to delete this section?",
                    [
                      { text: "Cancel" },
                      {
                        text: "OK",
                        onPress: () =>
                          setData((data) =>
                            data.filter((mdata) => mdata.id !== item.id)
                          ),
                      },
                    ],
                    { cancelable: true }
                  )
                }
              >
                <Ionicons name={"trash-outline"} size={25} color={"red"} />
              </Pressable>
            </View>
          </View>

          {/* Subtasks (Hidden if toggled off) */}
          {!item.hidden && (
            <TabsSubSectionElements data={item.data} setData={setData} whole_data={data} section_id={item.id}/>
          )}
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

/**
 * Main Page Component - LearnPage
 * Displays all sections and allows adding new ones.
 */
export default function LearnPage() {
  const [data, setData] = useState(dummy_data);

  // Initialize all sections as hidden on mount
  useEffect(() => {
    dummy_data = dummy_data.map((item) => ({
      ...item,
      hidden: true,
    }));
  }, []);

  // Add new section dynamically
  const handleSection = () => {
    const id = data.length == 0 ? 0 : data[data.length - 1].id + 1;
    const newSection = {
      id,
      name: `Section ${id}`,
      data: [
        { id: 0, task: "task 1", isdone: false },
        { id: 1, task: "task 2", isdone: true },
        { id: 2, task: "task 3", isdone: false },
        { id: 3, task: "task 4", isdone: true },
        { id: 4, task: "task 5", isdone: false },
      ],
      hidden: true,
    };
    setData([...data, newSection]);
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Button to Add New Section */}
      <Pressable style={styles.addSection} onPress={handleSection}>
        <Ionicons name={"add-circle"} color={"white"} size={25} />
        <Text style={styles.lightText}>Add a new Section</Text>
        <View></View>
      </Pressable>

      {/* Render All Sections */}
      <TabSection data={data} setData={setData} />
    </SafeAreaView>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  addSection: {
    flexDirection: "row",
    backgroundColor: "black",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },

  lightText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  section: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "teal",
    paddingVertical: 10,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  addSkillButton: {
    flexDirection: "row",
    backgroundColor: "teal",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginRight: 10,
  },

  addSkillText: {
    color: "white",
    marginLeft: 10,
  },

  taskCard: {
    padding: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },

  taskText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: "bold",
    color: "teal",
  },

  taskButton: {
    borderRadius: 5,
    padding: 5,
    width: 75,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
