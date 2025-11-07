import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PieChart } from "react-native-gifted-charts";

type Streak = {
  id: number;
  title: string;
  startDate: string;
  lastIncrement: string;
  count: number;
};

export default function StreakPage() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Streak | null>(null);
  const [title, setTitle] = useState("");

  const now = new Date();

  // Auto-increment streaks that have crossed 24h
  useEffect(() => {
    setStreaks((prev) =>
      prev.map((s) => {
        const diff =
          (now.getTime() - new Date(s.lastIncrement).getTime()) / (1000 * 60 * 60);
        if (diff >= 24) {
          return { ...s, count: s.count + 1, lastIncrement: now.toISOString() };
        }
        return s;
      })
    );
  }, []);

  // Add or update streak
  const handleSave = () => {
    if (!title.trim()) return Alert.alert("Empty", "Please enter a task name.");

    if (editItem) {
      setStreaks((prev) =>
        prev.map((s) => (s.id === editItem.id ? { ...s, title } : s))
      );
    } else {
      setStreaks((prev) => [
        ...prev,
        {
          id: Date.now(),
          title,
          startDate: now.toISOString(),
          lastIncrement: now.toISOString(),
          count: 1,
        },
      ]);
    }

    setModalVisible(false);
    setEditItem(null);
    setTitle("");
  };

  // Reset streak
  const handleReset = (id: number) => {
    Alert.alert(
      "Reset Streak",
      "Are you sure you want to reset this streak to 0?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Reset",
          style: "destructive",
          onPress: () =>
            setStreaks((prev) =>
              prev.map((s) =>
                s.id === id
                  ? { ...s, count: 0, startDate: now.toISOString(), lastIncrement: now.toISOString() }
                  : s
              )
            ),
        },
      ]
    );
  };

  // Delete streak
  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Streak",
      "Are you sure you want to delete this streak?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => setStreaks((prev) => prev.filter((s) => s.id !== id)),
        },
      ]
    );
  };

  // Calculate time remaining for next streak increment
  const timeUntilNext = (s: Streak) => {
    const last = new Date(s.lastIncrement);
    const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
    const diffMs = Math.max(next.getTime() - now.getTime(), 0);
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
  };

  const renderStreak = ({ item }: { item: Streak }) => {
    const hoursLeft = timeUntilNext(item);
    const percent = ((24 - hoursLeft) / 24) * 100;

    return (
      <View style={styles.streakCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <PieChart
            data={[{ value: percent, color: "#6366f1" }, { value: 100 - percent, color: "#e5e7eb" }]}
            radius={30}
            donut
            innerRadius={22}
            centerLabelComponent={() => (
              <Text style={{ fontSize: 10, fontWeight: "700" }}>
                {hoursLeft.toFixed(0)}h
              </Text>
            )}
          />
          <View>
            <Text style={styles.streakTitle}>{item.title}</Text>
            <Text style={styles.streakCount}>🔥 Day {item.count}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => {
            setEditItem(item);
            setTitle(item.title);
            setModalVisible(true);
          }}>
            <Ionicons name="create-outline" size={20} color="#6366f1" />
          </Pressable>

          <Pressable onPress={() => handleReset(item.id)}>
            <Ionicons name="refresh-outline" size={20} color="#f59e0b" />
          </Pressable>

          <Pressable onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={["#f8fafc", "#eef2ff"]} style={styles.header}>
        <Text style={styles.headerTitle}>My Streaks</Text>
        <Pressable
          style={[styles.pillBtn, styles.btnPrimary]}
          onPress={() => {
            setEditItem(null);
            setTitle("");
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.pillBtnText}>Add</Text>
        </Pressable>
      </LinearGradient>

      {streaks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flame-outline" size={36} color="#64748b" />
          <Text style={styles.emptyText}>No streaks yet. Add one to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={streaks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStreak}
          contentContainerStyle={{ padding: 12 }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editItem ? "Edit Streak" : "Add New Streak"}
            </Text>
            <TextInput
              placeholder="Streak title (e.g. Workout, Coding...)"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              maxLength={40}
            />
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ----------------------------- Styles ----------------------------- */

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

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: { color: "#64748b", fontSize: 14, marginTop: 8 },

  streakCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  streakTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  streakCount: { fontSize: 13, color: "#475569", marginTop: 2 },

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
    backgroundColor: "#f8fafc",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
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
