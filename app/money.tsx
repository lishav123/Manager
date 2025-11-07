/**
 * ---------------------------------------------------------------------------
 * MoneyPage — Expense, Income & Loan Tracker (with AsyncStorage)
 * ---------------------------------------------------------------------------
 *
 * PURPOSE:
 *   A personal finance tracker to record income, expenses, and loans.
 *   Automatically calculates totals and shows a clear summary.
 *
 * DATA STRUCTURE IN ASYNCSTORAGE:
 * ---------------------------------------------------------------------------
 * {
 *   skills: [],
 *   money: [
 *     { id, title, amount, category, type: "income" | "expense" | "loan", date }
 *   ],
 *   streak: [],
 *   journal: []
 * }
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

const CATEGORIES = ["food", "academics", "clothes", "travel", "others"];
const STORAGE_KEY = "@myAppData";

export default function MoneyPage() {
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("all");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("others");
  const [type, setType] = useState("expense");
  const [editId, setEditId] = useState(null);

  /* -------------------------------------------------------------------------
     Load & Save from AsyncStorage
     ------------------------------------------------------------------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const existing = await AsyncStorage.getItem(STORAGE_KEY);
        if (existing) {
          const parsed = JSON.parse(existing);
          const moneyData = parsed.money || [];
          setTransactions(moneyData);
        } else {
          const initial = { skills: [], money: [], streak: [], journal: [] };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } catch (err) {
        console.error("Load error:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        const existing = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = existing ? JSON.parse(existing) : {};
        const updated = { ...parsed, money: transactions };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Save error:", err);
      }
    };
    saveData();
  }, [transactions]);

  /* -------------------------------------------------------------------------
     Derived Calculations
     ------------------------------------------------------------------------- */
  const income = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const expense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const loan = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "loan")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const balance = income - expense - loan;

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.category === filter);

  /* -------------------------------------------------------------------------
     CRUD Operations
     ------------------------------------------------------------------------- */
  const handleSave = () => {
    const trimmedTitle = title.trim();
    const numAmount = parseFloat(amount);
    if (!trimmedTitle || isNaN(numAmount) || numAmount <= 0)
      return Alert.alert("Invalid", "Please enter valid title and amount.");

    if (editId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editId
            ? { ...t, title: trimmedTitle, amount: numAmount, category, type }
            : t
        )
      );
    } else {
      const newEntry = {
        id: Date.now(),
        title: trimmedTitle,
        amount: numAmount,
        category,
        type,
        date: new Date().toISOString(),
      };
      setTransactions((prev) => [newEntry, ...prev]);
    }

    setModalVisible(false);
    setEditId(null);
    setTitle("");
    setAmount("");
    setCategory("others");
    setType("expense");
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setTitle(item.title);
    setAmount(item.amount.toString());
    setCategory(item.category);
    setType(item.type);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () =>
            setTransactions((prev) => prev.filter((t) => t.id !== id)),
        },
      ]
    );
  };

  /* -------------------------------------------------------------------------
     Render Function
     ------------------------------------------------------------------------- */
  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionMeta}>
          {item.category} · {item.type}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={[
            styles.transactionAmount,
            item.type === "income"
              ? { color: "#16a34a" }
              : item.type === "loan"
              ? { color: "#ca8a04" }
              : { color: "#dc2626" },
          ]}
        >
          {item.type === "income" ? "+" : "-"}₹{item.amount}
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
          <Pressable onPress={() => handleEdit(item)}>
            <Ionicons name="create-outline" size={18} color="#6366f1" />
          </Pressable>
          <Pressable onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  /* -------------------------------------------------------------------------
     UI RENDER
     ------------------------------------------------------------------------- */
  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#f8fafc", "#eef2ff"]} style={styles.header}>
        <Text style={styles.headerTitle}>Money Tracker</Text>
        <Pressable
          style={[styles.pillBtn, styles.btnPrimary]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.pillBtnText}>Add</Text>
        </Pressable>
      </LinearGradient>

      {/* Summary */}
      <View style={styles.summaryArea}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text
          style={[
            styles.balanceValue,
            balance > 0
              ? { color: "#16a34a" }
              : balance < 0
              ? { color: "#dc2626" }
              : { color: "#facc15" },
          ]}
        >
          ₹{balance.toFixed(2)}
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#dcfce7" }]}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: "#16a34a" }]}>
              ₹{income.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#fee2e2" }]}>
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={[styles.statValue, { color: "#dc2626" }]}>
              ₹{expense.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#fef9c3" }]}>
            <Text style={styles.statLabel}>Loan</Text>
            <Text style={[styles.statValue, { color: "#ca8a04" }]}>
              ₹{loan.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Filter — Fixed Height */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          marginHorizontal: 10,
          paddingVertical: 6,
          elevation: 1,
        }}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["all", ...CATEGORIES]}
          keyExtractor={(item) => item}
          contentContainerStyle={{
            paddingHorizontal: 12,
            alignItems: "center",
            gap: 8,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilter(item)}
              style={[
                styles.categoryChip,
                filter === item && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  filter === item && styles.categoryTextActive,
                ]}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Transactions */}
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={36} color="#64748b" />
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalCard}
          >
            <Text style={styles.modalTitle}>
              {editId ? "Edit Transaction" : "Add Transaction"}
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

            {/* Category Chips */}
            <View style={styles.modalRow}>
              <Text style={styles.label}>Category:</Text>
              <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setCategory(item)}
                    style={[
                      styles.chipSmall,
                      category === item && styles.chipSmallActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipSmallText,
                        category === item && styles.chipSmallTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            {/* Type Selection */}
            <View style={styles.modalRow}>
              <Text style={styles.label}>Type:</Text>
              {["income", "expense", "loan"].map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    styles.chipSmall,
                    type === t && styles.chipSmallActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipSmallText,
                      type === t && styles.chipSmallTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.pillBtn, styles.btnGhost]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.pillBtnText, styles.btnGhostText]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.pillBtn, styles.btnPrimary]}
                onPress={handleSave}
              >
                <Text style={styles.pillBtnText}>Save</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------------------------
   Styles — Compact, Clean & Modern
   --------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },

  summaryArea: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
  },
  balanceLabel: { color: "#475569", fontWeight: "600" },
  balanceValue: { fontSize: 30, fontWeight: "800", marginVertical: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  statLabel: { fontSize: 13, color: "#334155", fontWeight: "600" },
  statValue: { fontSize: 16, fontWeight: "700", marginTop: 2 },

  categoryChip: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipActive: { backgroundColor: "#6366f1" },
  categoryText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
  },
  categoryTextActive: { color: "#fff" },

  transactionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  transactionMeta: { color: "#64748b", fontSize: 13, marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: "800" },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  emptyText: { color: "#64748b", marginTop: 8 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f8fafc",
  },
  modalRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  label: { fontWeight: "700", marginRight: 6, color: "#334155" },
  chipSmall: {
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSmallActive: { backgroundColor: "#6366f1" },
  chipSmallText: { color: "#334155", fontWeight: "600", fontSize: 13 },
  chipSmallTextActive: { color: "#fff" },

  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillBtnText: { color: "#fff", fontWeight: "700" },
  btnPrimary: { backgroundColor: "#6366f1" },
  btnGhost: { backgroundColor: "#e2e8f0" },
  btnGhostText: { color: "#0f172a" },
});
