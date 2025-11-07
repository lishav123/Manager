import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PieChart } from "react-native-gifted-charts";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense" | "loan";
  category: string;
  date: string;
};

const CATEGORIES = ["food", "academics", "cloths", "travel", "others"];

const nextId = (arr: Transaction[]) =>
  arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 0;

export default function MoneyPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  // ---- Derived financials
  const income = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((a, t) => a + t.amount, 0),
    [transactions]
  );
  const expense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((a, t) => a + t.amount, 0),
    [transactions]
  );
  const loan = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "loan")
        .reduce((a, t) => a + t.amount, 0),
    [transactions]
  );
  const balance = income - (expense + loan);

  // ---- Category totals for chart (expenses only)
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    CATEGORIES.forEach((c) => (totals[c] = 0));
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => (totals[t.category] += t.amount));
    return totals;
  }, [transactions]);

  const chartData = Object.keys(categoryTotals)
    .filter((cat) => categoryTotals[cat] > 0)
    .map((cat) => ({
      value: categoryTotals[cat],
      color:
        {
          food: "#22c55e",
          academics: "#6366f1",
          cloths: "#f97316",
          travel: "#06b6d4",
          others: "#a855f7",
        }[cat] || "#94a3b8",
      text: cat,
    }));

  // ---- SAFETY: PieChart cannot handle empty arrays (reduce crash)
  const SAFE_CHART_DATA =
    chartData.length > 0 ? chartData : [{ value: 1, color: "#e2e8f0" }];
  const noExpenseData = chartData.length === 0;

  // ---- CRUD
  const handleAddOrEdit = (tx: Omit<Transaction, "id" | "date">) => {
    if (editTx) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editTx.id ? { ...editTx, ...tx } : t))
      );
    } else {
      setTransactions((prev) => [
        ...prev,
        { ...tx, id: nextId(prev), date: new Date().toISOString() },
      ]);
    }
    setModalVisible(false);
    setEditTx(null);
  };

  const handleDelete = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTx =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.category === filter);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#f8fafc", "#eef2ff"]} style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Money</Text>
        <Pressable
          style={[styles.pillBtn, styles.btnPrimary, { borderRadius: 999 }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.pillBtnText}>Add</Text>
        </Pressable>
      </LinearGradient>

      {/* SUMMARY DASHBOARD (numeric view) */}
      <View style={styles.summaryArea}>
        {transactions.length === 0 ? (
          <View style={styles.emptySummary}>
            <Ionicons name="wallet-outline" size={28} color="#64748b" />
            <Text style={styles.emptySummaryTitle}>No transactions yet</Text>
            <Text style={styles.emptySummarySub}>
              Add your first income or expense
            </Text>
          </View>
        ) : (
          <View>
            {/* Balance Display */}
            <View style={styles.balanceCard}>
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
            </View>

            {/* Income / Expense / Loan Cards */}
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
        )}
      </View>


      {/* Category filter chips (compact) */}
      <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={["all", ...CATEGORIES]}
        keyExtractor={(item) => item}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 12,
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
              numberOfLines={1}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </Text>
          </Pressable>
        )}
      />
    </View>

      {/* Transactions */}
      <FlatList
        data={filteredTx}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#64748b" }}>
            No records found in this category
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.transactionCard,
              item.type === "income"
                ? styles.cardIncome
                : item.type === "expense"
                ? styles.cardExpense
                : styles.cardLoan,
            ]}
          >
            <View>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txMeta}>
                {item.category} · {item.type}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                style={[
                  styles.txAmount,
                  item.type === "expense" || item.type === "loan"
                    ? { color: "#dc2626" }
                    : { color: "#16a34a" },
                ]}
              >
                {item.type === "expense" || item.type === "loan" ? "- " : "+ "}
                ₹{item.amount}
              </Text>
              <Pressable onPress={() => (setEditTx(item), setModalVisible(true))}>
                <Ionicons name="create-outline" size={20} color="#475569" />
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Delete Transaction",
                    "Are you sure you want to delete this transaction?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Yes, Delete",
                        style: "destructive",
                        onPress: () => handleDelete(item.id),
                      },
                    ],
                    { cancelable: true }
                  )
                }
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </Pressable>

            </View>
          </View>
        )}
      />

      <TransactionModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditTx(null);
        }}
        onSubmit={handleAddOrEdit}
        editTx={editTx}
      />
    </SafeAreaView>
  );
}

/* ----------------------------- Modal ----------------------------- */

const TransactionModal = ({
  visible,
  onClose,
  onSubmit,
  editTx,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, "id" | "date">) => void;
  editTx: Transaction | null;
}) => {
  const [title, setTitle] = useState(editTx?.title || "");
  const [amount, setAmount] = useState(
    editTx?.amount != null ? String(editTx.amount) : ""
  );
  const [type, setType] = useState<Transaction["type"]>(editTx?.type || "expense");
  const [category, setCategory] = useState(editTx?.category || "others");

  // Reset fields when opening for "Add"
  useEffect(() => {
    if (!visible) return;
    if (!editTx) {
      setTitle("");
      setAmount("");
      setType("expense");
      setCategory("others");
    }
  }, [visible, editTx]);

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt))
      return Alert.alert("Invalid", "Please enter valid title and amount");
    onSubmit({ title: title.trim(), amount: amt, type, category });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalCard}
        >
          <Text style={styles.modalTitle}>
            {editTx ? "Edit Transaction" : "Add Transaction"}
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title (e.g. Bus fare)"
            style={styles.input}
          />
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Amount"
            style={styles.input}
          />

          {/* Type selector (compact) */}
          <View style={{ flexDirection: "row", marginTop: 10, gap: 6}}>
            {["income", "expense", "loan"].map((t) => (
              <Pressable
                key={t}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                onPress={() => setType(t as any)}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === t && styles.typeTextActive,
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Category selector (compact chips) */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginVertical: 20 }}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.modalActions}>
            <Pressable style={[styles.pillBtn, styles.btnGhost]} onPress={onClose}>
              <Text style={[styles.pillBtnText, styles.btnGhostText]}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.pillBtn, styles.btnPrimary]} onPress={handleSave}>
              <Text style={styles.pillBtnText}>Save</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

/* ----------------------------- Styles ----------------------------- */

const CHIP_HEIGHT = 32; // hard cap to prevent tall chips

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },

  summaryArea: { paddingVertical: 10 },
  chartRow: { alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  emptySummary: { alignItems: "center", paddingVertical: 20 },
  emptySummaryTitle: { fontSize: 16, fontWeight: "700", color: "#334155" },
  emptySummarySub: { fontSize: 13, color: "#64748b" },

  // Compact chips (filter + modal selectors)
  categoryChip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: CHIP_HEIGHT / 2,
    paddingHorizontal: 12,
    height: CHIP_HEIGHT,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  categoryChipActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  categoryText: { color: "#334155", fontWeight: "600", lineHeight: 18 },
  categoryTextActive: { color: "#fff" },

  typeChip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: CHIP_HEIGHT / 2,
    paddingHorizontal: 12,
    height: CHIP_HEIGHT,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  typeChipActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  typeText: { color: "#334155", fontWeight: "600", lineHeight: 18 },
  typeTextActive: { color: "#fff" },

  transactionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardIncome: { borderLeftWidth: 4, borderLeftColor: "#16a34a" },
  cardExpense: { borderLeftWidth: 4, borderLeftColor: "#dc2626" },
  cardLoan: { borderLeftWidth: 4, borderLeftColor: "#f59e0b" },
  txTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  txMeta: { fontSize: 12, color: "#64748b", marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: "700" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#f8fafc",
    marginVertical: 4,
  },

  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  pillBtnText: { color: "#fff", fontWeight: "700" },
  btnPrimary: { backgroundColor: "#6366f1" },
  btnGhost: { backgroundColor: "#e2e8f0" },
  btnGhostText: { color: "#0f172a" },
  categoryContainer: {
    height: 42,                // <- fixed height keeps FlatList from expanding
    alignSelf: "flex-start",   // ensures no flex stretching
  },
  balanceCard: {
  alignItems: "center",
  marginBottom: 10,
  paddingVertical: 6,
},
balanceLabel: {
  fontSize: 14,
  color: "#64748b",
  fontWeight: "600",
},
balanceValue: {
  fontSize: 32,
  fontWeight: "800",
  marginTop: 2,
},
statsRow: {
  flexDirection: "row",
  justifyContent: "space-evenly",
  alignItems: "center",
  marginTop: 4,
  paddingHorizontal: 8,
},
statCard: {
  flex: 1,
  marginHorizontal: 4,
  borderRadius: 12,
  paddingVertical: 10,
  alignItems: "center",
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 4,
},
statLabel: {
  fontSize: 13,
  color: "#334155",
  fontWeight: "600",
},
statValue: {
  fontSize: 16,
  fontWeight: "700",
  marginTop: 2,
},

});
