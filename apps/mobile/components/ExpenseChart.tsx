import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { colors } from "../constants/Colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_PADDING = 32;
const CHART_WIDTH = SCREEN_WIDTH - CHART_PADDING * 2;
const CHART_HEIGHT = 180;

const CATEGORY_COLORS: Record<string, string> = {
  feed: colors.primary,
  suplements: colors.secondary,
  medication: colors.tertiary,
  other: colors.accent2,
};

const CATEGORY_LABELS: Record<string, string> = {
  feed: "Feed",
  suplements: "Supplements",
  medication: "Medication",
  other: "Other",
};

interface ExpenseEntry {
  monthYear: string;
  category: string;
  total: number;
}

interface ProductionEntry {
  monthYear: string;
  total: number;
}

interface ExpenseChartProps {
  expenses: ExpenseEntry[];
  production?: ProductionEntry[];
  numMonths: number;
  onMonthsChange?: (months: number) => void;
}

export default function ExpenseChart({ expenses, production, numMonths, onMonthsChange }: ExpenseChartProps) {
  // Group expenses by month
  const monthMap = new Map<string, Record<string, number>>();
  expenses.forEach((e) => {
    if (!monthMap.has(e.monthYear)) monthMap.set(e.monthYear, {});
    const m = monthMap.get(e.monthYear)!;
    m[e.category] = (m[e.category] || 0) + e.total;
  });

  const months = Array.from(monthMap.keys()).sort();
  const monthData = months.map((m) => ({
    month: m,
    categories: monthMap.get(m)!,
    total: Object.values(monthMap.get(m)!).reduce((s, v) => s + v, 0),
  }));

  const maxTotal = Math.max(...monthData.map((d) => d.total), 1);
  const barWidth = months.length > 0 ? Math.max((CHART_WIDTH - 16) / months.length - 8, 20) : 40;
  const barGap = months.length > 0 ? (CHART_WIDTH - barWidth * months.length) / (months.length + 1) : 0;

  const totalExpenses = monthData.reduce((sum, d) => sum + d.total, 0);
  const avgMonthly = months.length > 0 ? totalExpenses / months.length : 0;

  const categories = ["feed", "suplements", "medication", "other"];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Expenses</Text>
        <View style={styles.rangeSelector}>
          {([6, 9, 12] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.rangeButton, numMonths === m && styles.rangeButtonActive]}
              onPress={() => onMonthsChange?.(m)}
            >
              <Text style={[styles.rangeButtonText, numMonths === m && styles.rangeButtonTextActive]}>
                {m}mo
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stacked Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {monthData.map((d, i) => {
            const x = barGap + i * (barWidth + barGap);
            let currentBottom = 0;
            return (
              <View key={i} style={{ position: "absolute", left: x, bottom: 0, width: barWidth }}>
                {categories.map((cat) => {
                  const value = d.categories[cat] || 0;
                  if (value === 0) return null;
                  const segHeight = (value / maxTotal) * (CHART_HEIGHT - 20);
                  const bottom = currentBottom;
                  currentBottom += segHeight;
                  return (
                    <View
                      key={cat}
                      style={{
                        position: "absolute",
                        bottom,
                        width: barWidth,
                        height: Math.max(segHeight, 1),
                        backgroundColor: CATEGORY_COLORS[cat],
                        borderRadius: currentBottom === (d.total / maxTotal) * (CHART_HEIGHT - 20) ? 3 : 0,
                      }}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
        <View style={styles.xAxis}>
          {months.map((m, i) => (
            <Text key={i} style={[styles.xLabel, { width: barWidth + barGap }]} numberOfLines={1}>
              {m.replace(/(\d+)\/(\d+)/, "$1/$2")}
            </Text>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {categories.map((cat) => (
          <View key={cat} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
            <Text style={styles.legendText}>{CATEGORY_LABELS[cat]}</Text>
          </View>
        ))}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalExpenses.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${avgMonthly.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Monthly Avg</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white, borderRadius: 16, padding: 16, margin: 16, marginTop: 0, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "600", color: colors.gray[900] },
  rangeSelector: { flexDirection: "row", gap: 4 },
  rangeButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, backgroundColor: colors.gray[100] },
  rangeButtonActive: { backgroundColor: colors.tertiary },
  rangeButtonText: { fontSize: 12, color: colors.gray[600] },
  rangeButtonTextActive: { color: colors.white },
  chartContainer: { marginBottom: 8 },
  chart: { height: CHART_HEIGHT, position: "relative" },
  xAxis: { flexDirection: "row", marginTop: 4 },
  xLabel: { fontSize: 9, color: colors.gray[400], textAlign: "center" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.gray[600] },
  statsRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: colors.tertiary },
  statLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
});
