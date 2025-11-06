/**
 * ---------------------------------------------------------------------------
 * LearnPage — Task Planner & Progress Tracker
 * ---------------------------------------------------------------------------
 *
 * PURPOSE:
 *   A React Native screen that lets users create "Sections" (projects) and
 *   manage "Tasks" within them. Displays progress visually using charts.
 *
 * KEY FEATURES:
 *   - Dynamic section creation & deletion
 *   - Add, complete, and remove tasks
 *   - Smooth expand/collapse animation for task lists
 *   - Summary dashboard (pie charts per section)
 *   - Fully documented, developer-friendly architecture
 *
 * TECHNOLOGIES:
 *   React Native + Expo + react-native-gifted-charts + expo-linear-gradient
 *
 * ---------------------------------------------------------------------------
 * STATE STRUCTURE OVERVIEW:
 * ---------------------------------------------------------------------------
 *  data = [
 *    {
 *      id: number,              // section ID
 *      name: string,            // section name
 *      data: [                  // tasks in this section
 *        { id: number, task: string, isdone: boolean }
 *      ]
 *    }
 *  ]
 *
 * ---------------------------------------------------------------------------
 * COMPONENT OVERVIEW:
 * ---------------------------------------------------------------------------
 *  - LearnPage          → main container; holds all state
 *  - SummaryCard        → small chart card showing section progress
 *  - SectionCard        → renders section header + tasks
 *  - TaskCard           → individual task row (toggle / delete)
 *  - AnimatedTaskList   → animated expand/collapse for tasks
 *  - SectionModal       → modal for creating new sections
 *  - TaskModal          → modal for adding a new task
 * ---------------------------------------------------------------------------
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
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

/* ---------------------------------------------------------------------------
   Utility functions — small helpers used across components
   --------------------------------------------------------------------------- */

// Generates the next incremental ID for any array
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 0);

// Counts how many tasks in a section are marked as completed
const countCompleted = (tasks) =>
  tasks.reduce((acc, t) => acc + (t.isdone ? 1 : 0), 0);

/* ---------------------------------------------------------------------------
   TaskCard — Displays one individual task with “Done” and “Delete” buttons
   --------------------------------------------------------------------------- */

const TaskCard = ({ task, sectionId, setData }) => {
  // Toggle a task’s completion state (immutable update)
  const toggleTask = () => {
    setData((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              data: section.data.map((t) =>
                t.id === task.id ? { ...t, isdone: !t.isdone } : t
              ),
            }
          : section
      )
    );
  };

  // Delete a task from its parent section
  const deleteTask = () => {
    setData((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, data: section.data.filter((t) => t.id !== task.id) }
          : section
      )
    );
  };

  return (
    <View
      style={[
        styles.taskCard,
        task.isdone ? styles.taskCardDone : styles.taskCardTodo,
      ]}
    >
      <Text style={[styles.taskText, task.isdone && styles.strike]}>
        {task.task}
      </Text>

      <View style={styles.taskActions}>
        {/* Done / Undone toggle */}
        <Pressable
          style={[
            styles.pillBtn,
            task.isdone ? styles.btnDone : styles.btnPrimary,
          ]}
          onPress={toggleTask}
        >
          <Text style={styles.pillBtnText}>
            {task.isdone ? "Undone" : "Done"}
          </Text>
        </Pressable>

        {/* Delete button */}
        <Pressable
          style={[styles.pillBtn, styles.btnDanger]}
          onPress={deleteTask}
        >
          <Text style={styles.pillBtnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

/* ---------------------------------------------------------------------------
   AnimatedTaskList — Collapsible FlatList of tasks with animation
   --------------------------------------------------------------------------- */

const AnimatedTaskList = ({ data, sectionId, setData, visible }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const rowHeight = 64;

  // Animate expansion and collapse
  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 350,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [visible]);

  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, data.length) * rowHeight + 6],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={{ height, opacity, overflow: "hidden" }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard task={item} sectionId={sectionId} setData={setData} />
        )}
        scrollEnabled={false}
      />
    </Animated.View>
  );
};

/* ---------------------------------------------------------------------------
   SummaryCard — Small chart card showing section progress in summary view
   --------------------------------------------------------------------------- */

const SummaryCard = ({ section }) => {
  const completed = countCompleted(section.data);
  const total = section.data.length || 1;
  const pending = Math.max(0, total - completed);

  const pieData = [
    { value: completed, color: "#22c55e" },
    { value: pending, color: "#cbd5e1" },
  ];

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>
        {section.name.length > 12
          ? section.name.slice(0, 12) + "…"
          : section.name}
      </Text>
      <PieChart
        data={pieData}
        donut
        radius={40}
        innerRadius={24}
        textColor="#0f172a"
        centerLabelComponent={() => (
          <Text style={{ fontWeight: "700", fontSize: 12 }}>
            {Math.round((completed / total) * 100)}%
          </Text>
        )}
      />
      <Text style={styles.summarySubtitle}>
        {completed} done · {pending} left
      </Text>
    </View>
  );
};

/* ---------------------------------------------------------------------------
   SectionCard — Main block for each section
   --------------------------------------------------------------------------- */

const SectionCard = ({ section, setData, openTaskModal }) => {
  const [visible, setVisible] = useState(false);
  const completed = countCompleted(section.data);
  const total = section.data.length;

  const deleteSection = () => {
    Alert.alert("Delete Section", `Delete "${section.name}"?`, [
      { text: "Cancel" },
      {
        text: "OK",
        style: "destructive",
        onPress: () =>
          setData((prev) => prev.filter((s) => s.id !== section.id)),
      },
    ]);
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section header */}
      <LinearGradient
        colors={["#ffffff", "#f8fafc"]}
        style={styles.sectionHeader}
      >
        <View style={styles.sectionTitleRow}>
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
            <Ionicons
              name={visible ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#334155"
            />
          </Pressable>
          <Text style={styles.sectionTitle}>
            {section.name.length > 12
              ? section.name.slice(0, 12) + "…"
              : section.name}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={[styles.iconBtn]}
            onPress={() => openTaskModal(section.id)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.iconBtnText}>Task</Text>
          </Pressable>
          <Pressable onPress={deleteSection}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.sectionMetaRow}>
        <Text style={styles.metaText}>
          {completed} / {total} completed
        </Text>
      </View>

      <AnimatedTaskList
        data={section.data}
        sectionId={section.id}
        setData={setData}
        visible={visible}
      />
    </View>
  );
};

/* ---------------------------------------------------------------------------
   SectionModal — For adding new sections
   --------------------------------------------------------------------------- */

const SectionModal = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed)
      return Alert.alert("Error", "Please enter a section name.");
    if (trimmed.length > 12)
      return Alert.alert("Too long", "Max 12 characters allowed.");
    onSubmit(trimmed);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalCard}
        >
          <Text style={styles.modalTitle}>Create New Section</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter section name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Pressable style={[styles.pillBtn, styles.btnGhost]} onPress={onClose}>
              <Text style={[styles.pillBtnText, styles.btnGhostText]}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.pillBtn, styles.btnPrimary]} onPress={handleSubmit}>
              <Text style={styles.pillBtnText}>Create</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

/* ---------------------------------------------------------------------------
   TaskModal — For adding tasks inside a section
   --------------------------------------------------------------------------- */

const TaskModal = ({ visible, onClose, onSubmit, sectionName }) => {
  const [task, setTask] = useState("");

  const handleSubmit = () => {
    if (!task.trim()) return;
    onSubmit(task.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalCard}
        >
          <Text style={styles.modalTitle}>Add Task to {sectionName}</Text>
          <TextInput
            value={task}
            onChangeText={setTask}
            placeholder="Enter task title"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Pressable style={[styles.pillBtn, styles.btnGhost]} onPress={onClose}>
              <Text style={[styles.pillBtnText, styles.btnGhostText]}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.pillBtn, styles.btnPrimary]} onPress={handleSubmit}>
              <Text style={styles.pillBtnText}>Add</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

/* ---------------------------------------------------------------------------
   LearnPage — Main container holding everything
   --------------------------------------------------------------------------- */

export default function LearnPage() {
  const [data, setData] = useState([]); // main state: sections + tasks
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);

  const activeSectionName = useMemo(
    () => data.find((s) => s.id === activeSectionId)?.name,
    [activeSectionId, data]
  );

  // Create a new section
  const handleCreateSection = (name) => {
    setData((prev) => [...prev, { id: nextId(prev), name, data: [] }]);
    setSectionModalVisible(false);
  };

  // Add a new task to current section
  const handleAddTask = (title) => {
    setData((prev) =>
      prev.map((s) =>
        s.id === activeSectionId
          ? { ...s, data: [...s.data, { id: nextId(s.data), task: title, isdone: false }] }
          : s
      )
    );
    setTaskModalVisible(false);
  };

  const openTaskModal = (sectionId) => {
    setActiveSectionId(sectionId);
    setTaskModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER BAR */}
      <LinearGradient colors={["#f8fafc", "#eef2ff"]} style={styles.headerBar}>
        <Text style={styles.headerTitle}>Your Planner</Text>
        <Pressable
          style={[styles.pillBtn, styles.btnPrimary]}
          onPress={() => setSectionModalVisible(true)}
        >
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.pillBtnText}>New Section</Text>
        </Pressable>
      </LinearGradient>

      {/* SUMMARY DASHBOARD */}
      <View style={styles.summaryArea}>
        {data.length === 0 ? (
          <View style={styles.emptySummary}>
            <Ionicons name="analytics-outline" size={26} color="#64748b" />
            <Text style={styles.emptySummaryTitle}>Summary is empty</Text>
            <Text style={styles.emptySummarySub}>
              Create your first section to get started.
            </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `summary-${item.id}`}
            renderItem={({ item }) => <SummaryCard section={item} />}
            contentContainerStyle={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              gap: 10,
            }}
          />
        )}
      </View>

      {/* SECTION LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <SectionCard
            section={item}
            setData={setData}
            openTaskModal={openTaskModal}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 60, color: "#64748b" }}>
            No sections yet. Tap “New Section” to begin.
          </Text>
        }
      />

      {/* MODALS */}
      <SectionModal
        visible={sectionModalVisible}
        onClose={() => setSectionModalVisible(false)}
        onSubmit={handleCreateSection}
      />
      <TaskModal
        visible={taskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        onSubmit={handleAddTask}
        sectionName={activeSectionName}
      />
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------------------------
   Styles — Clean, light modern look with rounded corners & teal/indigo hues
   --------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },

  /* SUMMARY SECTION */
  summaryArea: { paddingTop: 10, paddingBottom: 6 },
  summaryCard: {
    width: 160,
    height: 140,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  summarySubtitle: { fontSize: 13, color: "#475569", textAlign: "center" },
  emptySummary: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  emptySummaryTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  emptySummarySub: { marginTop: 4, fontSize: 13, color: "#64748b" },

  /* SECTION + TASKS */
  sectionContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { marginLeft: 10, fontSize: 16, fontWeight: "700" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionMetaRow: { paddingHorizontal: 14, paddingTop: 8 },
  metaText: { fontSize: 12, color: "#64748b" },

  /* TASKS */
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  taskCardDone: { backgroundColor: "#f0fdf4", borderColor: "#dcfce7" },
  taskCardTodo: { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" },
  taskText: { fontSize: 15, fontWeight: "600" },
  strike: { textDecorationLine: "line-through", color: "#64748b" },
  taskActions: { flexDirection: "row" },

  /* BUTTONS */
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
  btnDone: { backgroundColor: "#10b981" },
  btnDanger: { backgroundColor: "#ef4444", marginLeft: 8 },
  btnGhost: { backgroundColor: "#e2e8f0" },
  btnGhostText: { color: "#0f172a" },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  iconBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  /* MODALS */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
});
