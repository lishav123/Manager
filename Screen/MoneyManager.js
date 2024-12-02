import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, FlatList, TouchableOpacity, Text, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MoneyManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [amountInput, setAmountInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [editAmountInput, setEditAmountInput] = useState('');
  const [editDescriptionInput, setEditDescriptionInput] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem('transactions');
        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        }
      } catch (error) {
        console.error("Failed to load transactions", error);
      }
    };
    loadTransactions();
  }, []);

  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to save transactions", error);
      }
    };
    saveTransactions();
  }, [transactions]);

  const addTransaction = (isIncome) => {
    if (!amountInput || !descriptionInput) return;

    const newTransaction = {
      id: Date.now().toString(),
      amount: isIncome ? parseFloat(amountInput) : -parseFloat(amountInput),
      description: descriptionInput,
    };

    setTransactions(prev => [...prev, newTransaction]);
    setAmountInput('');
    setDescriptionInput('');
    setShowCard(false); // Hide the input card
  };

  const openEditModal = (transaction) => {
    setEditTransaction(transaction);
    setEditAmountInput(Math.abs(transaction.amount).toString());
    setEditDescriptionInput(transaction.description);
  };

  const saveEdit = () => {
    if (editTransaction) {
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === editTransaction.id ? { ...transaction, amount: editTransaction.amount < 0 ? -parseFloat(editAmountInput) : parseFloat(editAmountInput), description: editDescriptionInput } : transaction
      );
      setTransactions(updatedTransactions);
      closeEditModal();
    }
  };

  const closeEditModal = () => {
    setEditTransaction(null);
    setEditAmountInput('');
    setEditDescriptionInput('');
  };

  const deleteTransaction = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Do you really want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => setTransactions(transactions.filter(transaction => transaction.id !== id)) }
      ]
    );
  };

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netAmount = totalIncome - totalExpenses;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money Manager</Text>
      <Text style={styles.summary}>
        Total Income: <Text style={styles.profit}>₹{totalIncome.toFixed(2)}</Text> | 
        Total Expenses: <Text style={styles.loss}>₹{totalExpenses.toFixed(2)}</Text> |
        Net Amount: <Text style={netAmount >= 0 ? styles.profit : styles.loss}>₹{netAmount.toFixed(2)}</Text>
      </Text>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.transactionCard, item.amount >= 0 ? styles.cardProfit : styles.cardLoss]}>
            <View style={styles.transactionContent}>
              <Text style={[styles.transactionDescription, styles.boldText]}>{item.description}</Text>
              <Text style={item.amount >= 0 ? styles.profit : styles.loss}>₹{Math.abs(item.amount).toFixed(2)}</Text>
            </View>
            <View style={styles.transactionButtons}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTransaction(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {showCard && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amountInput}
            keyboardType="numeric"
            onChangeText={setAmountInput}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={descriptionInput}
            onChangeText={setDescriptionInput}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => addTransaction(true)} style={styles.createButton}>
              <Text style={styles.buttonText}>Add Income</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addTransaction(false)} style={styles.createButton}>
              <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!showCard && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCard(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={!!editTransaction}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Edit Amount"
              value={editAmountInput}
              keyboardType="numeric"
              onChangeText={setEditAmountInput}
            />
            <TextInput
              style={styles.input}
              placeholder="Edit Description"
              value={editDescriptionInput}
              onChangeText={setEditDescriptionInput}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={saveEdit} style={styles.createButton}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeEditModal} style={styles.cancelButton}>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  summary: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  profit: {
    color: 'green',
    fontWeight: 'bold',
  },
  loss: {
    color: 'red',
    fontWeight: 'bold',
  },
  transactionCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  cardProfit: {
    backgroundColor: '#e0ffe0',
  },
  cardLoss: {
    backgroundColor: '#ffe0e0',
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDescription: {
    fontSize: 16,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  transactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 5,
  },
  editButtonText: {
    color: 'white',
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 5,
  },
  deleteButtonText: {
    color: 'white',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
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
});

export default MoneyManager;
