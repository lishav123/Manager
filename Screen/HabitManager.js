import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Habit Manager Component
const HabitManager = () => {
  const [tasks, setTasks] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [storedDate, setStoredDate] = useState(null);
  const [daysPassed, setDaysPassed] = useState(0);
  const [fabVisible, setFabVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchStoredDate = async () => {
      try {
        const date = await AsyncStorage.getItem('storedDate');
        if (date) {
          const parsedDate = new Date(date);
          setStoredDate(parsedDate);
          calculateDaysPassed(parsedDate);
        } else {
          await setNewDateToCurrent();
        }
      } catch (error) {
        console.error("Error fetching stored date:", error);
      }
    };

    fetchStoredDate();
    loadTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateDaysPassed = (date) => {
    const today = new Date();
    const timeDiff = today.getTime() - date.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    setDaysPassed(dayDiff);
  };

  const setNewDateToCurrent = async () => {
    const currentDate = new Date();
    await AsyncStorage.setItem('storedDate', currentDate.toISOString());
    setStoredDate(currentDate);
    setDaysPassed(0);
  };

  const resetDate = async () => {
    await setNewDateToCurrent();
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset Date",
      "Are you sure you want to reset the date to today?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: resetDate }
      ]
    );
  };

  const calculateTimeLeft = () => {
    const now = new Date();
    const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeDiff = nextDay - now;
    const hoursLeft = Math.max(0, Math.floor(timeDiff / (1000 * 3600))); // Ensure time left doesn't go negative
    setTimeLeft(hoursLeft);
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks_habit');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const saveTasks = async (newTasks) => {
    setTasks(newTasks);
    await AsyncStorage.setItem('tasks_habit', JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (taskInput.trim() === '') return;

    const newTask = {
      id: Date.now().toString(),
      title: taskInput,
      checked: false,
    };
    saveTasks([...tasks, newTask]);
    setTaskInput('');
    setInputVisible(false);
  };

  const editTask = (id) => {
    const taskToEdit = tasks.find(task => task.id === id);
    setTaskInput(taskToEdit.title);
    setEditingTaskId(id);
    setInputVisible(true);
  };

  const updateTask = () => {
    const updatedTasks = tasks.map(task =>
      task.id === editingTaskId ? { ...task, title: taskInput } : task
    );
    saveTasks(updatedTasks);
    setTaskInput('');
    setInputVisible(false);
    setEditingTaskId(null);
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteTask(id) }
      ]
    );
  };

  const deleteTask = (id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    saveTasks(newTasks);
  };

  const toggleTaskCheck = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, checked: !task.checked } : task
    );
    saveTasks(updatedTasks);
  };

  const handleCreateOrEdit = () => {
    if (editingTaskId) {
      updateTask();
    } else {
      addTask();
    }
  };

  const resetCheckboxes = () => {
    const resetTasks = tasks.map(task => ({ ...task, checked: false }));
    saveTasks(resetTasks);
  };

  useEffect(() => {
    if (daysPassed > 0) {
      resetCheckboxes();
    }
  }, [daysPassed]);

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {storedDate ? `Started At: ${storedDate.toLocaleDateString()}` : 'No date stored'}
        </Text>
        <View style={styles.streakContainer}>
          <Text>Streak: </Text>
          <Text style={styles.streakValue}>{daysPassed} Days</Text>
        </View>
      </View>

      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>Time Left for Next Day: {timeLeft} hours</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${100 - ((timeLeft / 24) * 100)}%` }]} />
        </View>
      </View>

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Pressable onPress={() => toggleTaskCheck(item.id)}>
              <MaterialIcons name={item.checked ? "check-box" : "check-box-outline-blank"} size={24} color={item.checked ? 'green' : 'gray'} />
            </Pressable>
            <Text style={[styles.taskText, item.checked && styles.checkedTask]}>{item.title}</Text>
            <View style={styles.buttonContainer}>
              <Pressable onPress={() => editTask(item.id)} style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      {inputVisible && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter task"
            value={taskInput}
            onChangeText={setTaskInput}
          />
          <View style={styles.buttonContainer}>
            <Pressable onPress={handleCreateOrEdit} style={styles.createButton}>
              <LinearGradient colors={['#000000', '#434343']} style={styles.gradientButton}>
                <Text style={styles.buttonText}>Create</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => { setInputVisible(false); setTaskInput(''); }} style={styles.cancelButton}>
              <LinearGradient colors={['#ff7f50', '#ffcc99']} style={styles.gradientButton}>
                <Text style={[styles.buttonText, { color: '#fff' }]}>Cancel</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      <Pressable style={styles.fab} onPress={() => setFabVisible(!fabVisible)}>
        <MaterialIcons name="add" size={24} color="white" />
      </Pressable>

      {fabVisible && (
        <View style={styles.subFabContainer}>
          <Pressable style={styles.subFab} onPress={() => { setInputVisible(true); setFabVisible(false); }}>
            <Text style={styles.subFabText}>Add a new Habit</Text>
          </Pressable>
          <Pressable style={styles.subFab} onPress={confirmReset}>
            <Text style={styles.subFabText}>Reset the streak</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakValue: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'blue',
  },
  loaderContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loaderText: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'green',
    borderRadius: 5,
  },
  taskCard: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskText: {
    fontSize: 18,
    flex: 1,
    marginLeft: 10,
  },
  checkedTask: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginLeft: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  editText: {
    color: 'blue',
  },
  deleteText: {
    color: 'red',
  },
  inputContainer: {
    marginVertical: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
  },
  createButton: {
    marginRight: 10,
    marginTop: 10,
  },
  cancelButton: {
    marginRight: 10,
    marginTop: 10,
  },
  gradientButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  subFabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  subFab: { 
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subFabText: {
    color: '#6200ee',
    fontSize: 16,
  },
});

export default HabitManager;
