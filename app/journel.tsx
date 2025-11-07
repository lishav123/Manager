import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "react-native-calendars";
import Ionicons from "@expo/vector-icons/Ionicons";

type JournalEntry = {
  date: string;
  title: string;
  text: string;
};

export default function JournalPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const MAX_CHARS = 1500;

  const currentEntry = useMemo(
    () => journals.find((j) => j.date === selectedDate),
    [journals, selectedDate]
  );

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();

    if (!trimmedTitle) return Alert.alert("Missing title", "Please add a title.");
    if (!trimmedText) return Alert.alert("Empty journal", "Write something meaningful!");
    if (trimmedText.length > MAX_CHARS)
      return Alert.alert("Limit exceeded", `Keep your journal under ${MAX_CHARS} characters.`);

    setJournals((prev) => {
      const exists = prev.find((j) => j.date === selectedDate);
      if (exists) {
        return prev.map((j) =>
          j.date === selectedDate ? { ...j, title: trimmedTitle, text: trimmedText } : j
        );
      }
      return [...prev, { date: selectedDate, title: trimmedTitle, text: trimmedText }];
    });

    setWriteModalVisible(false);
    setTitle("");
    setText("");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Journal",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => {
            setJournals((prev) =>
              prev.filter((j) => j.date !== selectedDate)
            );
            setViewModalVisible(false);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#f8fafc", "#eef2ff"]} style={styles.header}>
        <Text style={styles.headerTitle}>My Journal</Text>

        <Pressable
          style={[styles.pillBtn, styles.btnPrimary]}
          onPress={() => {
            setTitle(currentEntry?.title || "");
            setText(currentEntry?.text || "");
            setWriteModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.pillBtnText}>Write</Text>
        </Pressable>
      </LinearGradient>

      {/* Calendar */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: "#6366f1",
            selectedTextColor: "white",
          },
          ...journals.reduce((acc, j) => {
            acc[j.date] = {
              marked: true,
              dotColor: "#10b981",
              ...(j.date === selectedDate
                ? { selected: true, selectedColor: "#6366f1" }
                : {}),
            };
            return acc;
          }, {} as Record<string, any>),
        }}
        theme={{
          textDayFontWeight: "600",
          todayTextColor: "#0ea5e9",
          arrowColor: "#6366f1",
        }}
        style={styles.calendar}
      />

      {/* Journal Card */}
      <View style={styles.entryCard}>
        <Text style={styles.entryDate}>
          {new Date(selectedDate).toDateString()}
        </Text>

        {currentEntry ? (
          <>
            <Text style={styles.entryTitle}>{currentEntry.title}</Text>
            <Pressable
              style={[styles.pillBtn, styles.btnPrimary, { alignSelf: "flex-end" }]}
              onPress={() => setViewModalVisible(true)}
            >
              <Ionicons name="book-outline" size={18} color="#fff" />
              <Text style={styles.pillBtnText}>View Entry</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.emptyText}>
            No journal entry for this day. Tap “Write” to add one.
          </Text>
        )}
      </View>

      {/* FULL-SCREEN WRITE MODAL */}
      <Modal visible={writeModalVisible} animationType="slide">
        <SafeAreaView style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setWriteModalVisible(false)}>
              <Ionicons name="arrow-back-outline" size={24} color="#0f172a" />
            </Pressable>
            <Text style={styles.modalHeaderText}>
              {new Date(selectedDate).toDateString()}
            </Text>
            <Pressable onPress={handleSave}>
              <Ionicons name="save-outline" size={24} color="#6366f1" />
            </Pressable>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Journal Title"
            maxLength={60}
            style={styles.titleInput}
          />

          <TextInput
            style={styles.fullInput}
            multiline
            value={text}
            onChangeText={setText}
            placeholder="Write your journal..."
            maxLength={MAX_CHARS}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{text.length}/{MAX_CHARS}</Text>
        </SafeAreaView>
      </Modal>

      {/* FULL-SCREEN VIEW MODAL */}
      <Modal visible={viewModalVisible} animationType="slide">
        <SafeAreaView style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setViewModalVisible(false)}>
              <Ionicons name="arrow-back-outline" size={24} color="#0f172a" />
            </Pressable>
            <Text style={styles.modalHeaderText}>
              {new Date(selectedDate).toDateString()}
            </Text>
            <View style={{ flexDirection: "row", gap: 14 }}>
              <Pressable
                onPress={() => {
                  setTitle(currentEntry?.title || "");
                  setText(currentEntry?.text || "");
                  setWriteModalVisible(true);
                  setViewModalVisible(false);
                }}
              >
                <Ionicons name="create-outline" size={22} color="#6366f1" />
              </Pressable>
              <Pressable onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color="#dc2626" />
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.fullView}>
            <Text style={styles.fullTitle}>{currentEntry?.title}</Text>
            <Text style={styles.fullText}>{currentEntry?.text}</Text>
          </ScrollView>
        </SafeAreaView>
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

  calendar: {
    borderRadius: 12,
    margin: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  entryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  entryDate: { fontSize: 14, fontWeight: "600", color: "#475569" },
  entryTitle: { marginTop: 8, fontSize: 17, fontWeight: "700", color: "#0f172a" },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
  },

  // Full-screen modals
  fullModal: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalHeaderText: { fontSize: 16, fontWeight: "700", color: "#0f172a" },

  titleInput: {
    fontSize: 17,
    fontWeight: "700",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    elevation: 2,
  },

  fullInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 12,
    textAlignVertical: "top",
    elevation: 2,
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#64748b",
    marginVertical: 6,
  },

  fullView: { flex: 1, padding: 12 },
  fullTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  fullText: {
    fontSize: 16,
    color: "#0f172a",
    lineHeight: 24,
    marginBottom: 50
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
});
