import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Pressable } from 'react-native';
import Modal from 'react-native-modal';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AcademicManager() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks", error);
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasksToSave));
    } catch (error) {
      console.error("Error saving tasks", error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setSubject('');
  };

  const createTask = () => {
    if (subject.trim()) {
      const newTask = { id: Math.random().toString(), subject, attended: 0, total: 1 };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      toggleModal();
    } else {
      Alert.alert("Task Subject Required", "Please enter a task subject.");
    }
  };

  const deleteTask = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);
            saveTasks(updatedTasks);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const increaseAttended = (id) => {
    const updatedTasks = tasks.map(task => task.id === id ? { ...task, attended: task.attended + 1 } : task);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const decreaseAttended = (id) => {
    const updatedTasks = tasks.map(task => task.id === id && task.attended > 0 ? { ...task, attended: task.attended - 1 } : task);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const increaseTotal = (id) => {
    const updatedTasks = tasks.map(task => task.id === id ? { ...task, total: task.total + 1 } : task);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const decreaseTotal = (id) => {
    const updatedTasks = tasks.map(task => task.id === id && task.total > 1 ? { ...task, total: task.total - 1 } : task);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const renderTask = ({ item }) => {
    const percentage = ((item.attended / item.total) * 100).toFixed(0) || 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.taskText}>{item.subject}</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
        <View style={styles.attendanceContainer}>
          <View style={styles.section}>
            <Text style={styles.subText}>DAYS ATTENDED</Text>
            <Text style={styles.attendanceText}>{item.attended}</Text>
            <View style={styles.buttonContainer}>
              <Pressable onPress={() => decreaseAttended(item.id)} style={styles.attendanceButton}>
                <Icon name="remove" size={20} color="#fff" />
              </Pressable>
              <Pressable onPress={() => increaseAttended(item.id)} style={styles.attendanceButton}>
                <Icon name="add" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.attendanceText}>{item.attended} / {item.total}</Text>
            <Text style={styles.subText}>TOTAL DAYS</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.subText}>TOTAL CLASSES</Text>
            <Text style={styles.attendanceText}>{item.total}</Text>
            <View style={styles.buttonContainer}>
              <Pressable onPress={() => decreaseTotal(item.id)} style={styles.attendanceButton}>
                <Icon name="remove" size={20} color="#fff" />
              </Pressable>
              <Pressable onPress={() => increaseTotal(item.id)} style={styles.attendanceButton}>
                <Icon name="add" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
        <Pressable onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
      />

      <LinearGradient
        colors={['#000', '#444']}
        style={styles.gradientButton}
      >
        <Pressable onPress={toggleModal} style={styles.pressable}>
          <Text style={styles.buttonText}>Add Task</Text>
        </Pressable>
      </LinearGradient>

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <TextInput
            label="Task Subject"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.buttonContainer}>
            <Pressable onPress={createTask} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Task</Text>
            </Pressable>
            <Pressable onPress={toggleModal} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  attendanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  section: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: 18,
    marginVertical: 5,
    color: '#000',
  },
  attendanceButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  deleteButton: {
    alignItems: 'flex-end',
  },
  deleteText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradientButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 8,
  },
  pressable: {
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#000',
  },
  subText: {
    fontSize: 12,
    color: '#777',
  },
});
