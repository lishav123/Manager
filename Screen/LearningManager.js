import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, FlatList, TouchableOpacity, Text, Alert, Animated, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { AntDesign } from '@expo/vector-icons';

const LearningManager = () => {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [animations] = useState([]); // Initialize animations as an empty array
  const [editingTask, setEditingTask] = useState(null);
  const [editInput, setEditInput] = useState('');

  // Load tasks from AsyncStorage when the component mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks_learn');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          setTasks(parsedTasks);
          animations.push(...parsedTasks.map(() => new Animated.Value(1))); // Initialize animations for existing tasks
        }
      } catch (error) {
        console.error("Failed to load tasks from storage", error);
      }
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks_learn', JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to storage", error);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (taskInput) {
      const newTask = { id: Date.now().toString(), title: taskInput, completed: false };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setTaskInput('');
      setIsCreating(false);
      animations.push(new Animated.Value(1)); // Add animation for new task
    }
  };

  const deleteTask = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => setTasks(tasks.filter(task => task.id !== id)) }
      ]
    );
  };

  const toggleComplete = (id) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex >= 0) {
      const updatedTasks = tasks.map((task, index) =>
        index === taskIndex ? { ...task, completed: !task.completed } : task
      );

      setTasks(updatedTasks);

      // Optionally, animate the change
      Animated.timing(animations[taskIndex], {
        toValue: updatedTasks[taskIndex].completed ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditInput(task.title);
  };

  const saveEdit = () => {
    if (editingTask && editInput) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, title: editInput } : task
      ));
      setEditingTask(null);
      setEditInput('');
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const notCompletedTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.taskCount}>
        {completedCount} out of {tasks.length} tasks completed
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Not Completed ({notCompletedTasks.length})
        </Text>
        {notCompletedTasks.length === 0 ? (
          <Text style={styles.noTasksText}>No tasks to show here</Text>
        ) : (
          <FlatList
            data={notCompletedTasks}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <Animated.View style={[styles.taskCard, { opacity: animations[index] }]}>
                <Checkbox
                  value={item.completed}
                  onValueChange={() => toggleComplete(item.id)}
                />
                <Text style={styles.taskText}>{item.title}</Text>
                <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconButton}>
                  <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                  <AntDesign name="edit" size={24} color="blue" />
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Completed ({completedTasks.length})
        </Text>
        <TouchableOpacity onPress={() => setShowCompleted(!showCompleted)} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </Text>
        </TouchableOpacity>
        
        {showCompleted && completedTasks.length === 0 ? (
          <Text style={styles.noTasksText}>No tasks to show here</Text>
        ) : (
          showCompleted && (
            <FlatList
              data={completedTasks}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskCard}>
                  <Checkbox
                    value={item.completed}
                    onValueChange={() => toggleComplete(item.id)}
                    color="#4CAF50"
                  />
                  <Text style={[styles.taskText, styles.completed]}>{item.title}</Text>
                  <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconButton}>
                    <AntDesign name="delete" size={24} color="red" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                    <AntDesign name="edit" size={24} color="blue" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )
        )}
      </View>

      {isCreating && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter task"
            value={taskInput}
            onChangeText={setTaskInput}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={addTask} style={styles.createButton}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsCreating(false)} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setIsCreating(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Edit Task Modal */}
      <Modal
        visible={!!editingTask}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingTask(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Edit task"
              value={editInput}
              onChangeText={setEditInput}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={saveEdit} style={styles.createButton}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingTask(null)} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  taskCount: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  noTasksText: {
    color: 'gray',
    fontStyle: 'italic',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  taskText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 30,
  },
  toggleButton: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  iconButton: {
    marginLeft: 20,
  },
});

export default LearningManager;
