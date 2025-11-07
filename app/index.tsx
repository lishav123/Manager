import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PieChart } from "react-native-gifted-charts";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "@myAppData";

/* ---------------------------------------------------------------------------
   Types
--------------------------------------------------------------------------- */
type Section = { id: number; name: string; data: { isdone: boolean }[] };
type MoneyEntry = { amount: number; type: "income" | "expense"; category: string };
type Streak = { id: number; title: string; count: number };
type Journal = { date: string; title: string; text: string };

/* ---------------------------------------------------------------------------
   Dashboard Component
--------------------------------------------------------------------------- */
export default function IndexPage() {
  const [data, setData] = useState<{
    skills: Section[];
    money: MoneyEntry[];
    streak: Streak[];
    journal: Journal[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* -------------------------------------------------------------------------
     Load data when screen is focused
  ------------------------------------------------------------------------- */
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            setData(JSON.parse(stored));
          } else {
            const initial = { skills: [], money: [], streak: [], journal: [] };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
            setData(initial);
          }
        } catch (err) {
          console.error("Error loading dashboard data:", err);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };
      loadData();
    }, [])
  );

  /* -------------------------------------------------------------------------
     Pull-to-refresh handler
  ------------------------------------------------------------------------- */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setData(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  /* -------------------------------------------------------------------------
     Derived Summaries
  ------------------------------------------------------------------------- */

  // Skills
  const skillStats = useMemo(() => {
    if (!data?.skills.length) return { total: 0, completed: 0 };
    let total = 0,
      completed = 0;
    data.skills.forEach((s) => {
      total += s.data.length;
      completed += s.data.filter((t) => t.isdone).length;
    });
    return { total, completed };
  }, [data]);

  // Money
  const moneyStats = useMemo(() => {
    if (!data?.money.length) return { balance: 0, income: 0, expense: 0 };
    let income = 0,
      expense = 0;
    data.money.forEach((m) =>
      m.type === "income" ? (income += m.amount) : (expense += m.amount)
    );
    return { income, expense, balance: income - expense };
  }, [data]);

  // Streaks
  const streakStats = useMemo(() => {
    if (!data?.streak.length) return { total: 0, longest: 0 };
    const longest = Math.max(...data.streak.map((s) => s.count));
    return { total: data.streak.length, longest };
  }, [data]);

  // Journal
  const lastJournal = useMemo(() => {
    if (!data?.journal.length) return null;
    const latest = [...data.journal].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    return latest;
  }, [data]);

  /* -------------------------------------------------------------------------
     UI
  ------------------------------------------------------------------------- */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <LinearGradient colors={["#f8fafc", "#eef2ff"]} style={styles.header}>
        <Text style={styles.headerTitle}>Your Dashboard</Text>
      </LinearGradient>

      {/* CONTENT */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 16 }}
      >
        {/* SKILLS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Learning Progress</Text>
            <Ionicons name="book-outline" size={22} color="#6366f1" />
          </View>

          {skillStats.total === 0 ? (
            <Text style={styles.emptyText}>No sections yet. Add one in Learn.</Text>
          ) : (
            <View style={styles.row}>
              <PieChart
                data={[
                  { value: skillStats.completed, color: "#10b981" },
                  { value: skillStats.total - skillStats.completed, color: "#e2e8f0" },
                ]}
                donut
                radius={45}
                innerRadius={30}
                centerLabelComponent={() => (
                  <Text style={{ fontWeight: "700", fontSize: 12 }}>
                    {Math.round((skillStats.completed / skillStats.total) * 100)}%
                  </Text>
                )}
              />
              <Text style={styles.statText}>
                {skillStats.completed}/{skillStats.total} tasks completed
              </Text>
            </View>
          )}
        </View>

        {/* MONEY */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Finance</Text>
            <Ionicons name="wallet-outline" size={22} color="#6366f1" />
          </View>

          {data?.money.length === 0 ? (
            <Text style={styles.emptyText}>No financial data yet.</Text>
          ) : (
            <View>
              <Text style={styles.statText}>
                💰 Balance:{" "}
                <Text
                  style={{
                    color:
                      moneyStats.balance > 0
                        ? "#16a34a"
                        : moneyStats.balance < 0
                        ? "#dc2626"
                        : "#eab308",
                    fontWeight: "700",
                  }}
                >
                  ₹{moneyStats.balance.toFixed(2)}
                </Text>
              </Text>
              <Text style={styles.subStatText}>
                +₹{moneyStats.income.toFixed(2)} income · -₹
                {moneyStats.expense.toFixed(2)} expense
              </Text>
            </View>
          )}
        </View>

        {/* STREAKS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Streaks</Text>
            <Ionicons name="flame-outline" size={22} color="#6366f1" />
          </View>
          {streakStats.total === 0 ? (
            <Text style={styles.emptyText}>No streaks yet.</Text>
          ) : (
            <Text style={styles.statText}>
              🔥 {streakStats.total} active · Longest: {streakStats.longest} days
            </Text>
          )}
        </View>

        {/* JOURNAL */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Journal</Text>
            <Ionicons name="document-text-outline" size={22} color="#6366f1" />
          </View>
          {lastJournal ? (
            <View>
              <Text style={styles.statText}>🗓️ {lastJournal.date}</Text>
              <Text style={styles.subStatText} numberOfLines={1}>
                {lastJournal.title}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No journal entries yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------------------------
   Styles
--------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  statText: { fontSize: 14, color: "#334155", fontWeight: "600" },
  subStatText: { fontSize: 13, color: "#64748b", marginTop: 4 },
  emptyText: { fontSize: 13, color: "#94a3b8", fontStyle: "italic" },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
});
