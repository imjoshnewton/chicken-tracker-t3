import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { format, eachDayOfInterval } from "date-fns";
import { colors } from "../constants/Colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_PADDING = 32;
const CHART_WIDTH = SCREEN_WIDTH - CHART_PADDING * 2;
const CHART_HEIGHT = 180;

interface LogEntry {
  date: string;
  count: number;
}

interface ProductionChartProps {
  logs: LogEntry[];
  range: { from: Date; to: Date };
  thisWeekAvg?: { avg: number };
  lastWeekAvg?: { avg: number };
  breeds?: { count: number; averageProduction: number }[];
}

export default function ProductionChart({ logs, range, thisWeekAvg, lastWeekAvg, breeds }: ProductionChartProps) {
  const [selectedRange, setSelectedRange] = React.useState<7 | 15 | 30>(30);

  // Build chart data from logs
  const adjustedFrom = new Date(range.to);
  adjustedFrom.setDate(adjustedFrom.getDate() - selectedRange + 1);
  const days = eachDayOfInterval({ start: adjustedFrom, end: range.to });

  const logMap = new Map<string, number>();
  logs.forEach((log) => {
    const key = format(new Date(log.date), "yyyy-MM-dd");
    logMap.set(key, (logMap.get(key) || 0) + log.count);
  });

  const data = days.map((day) => ({
    date: day,
    count: logMap.get(format(day, "yyyy-MM-dd")) || 0,
  }));

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalEggs = data.reduce((sum, d) => sum + d.count, 0);
  const avgPerDay = data.length > 0 ? totalEggs / data.length : 0;

  // Calculate target daily average based on breed data
  const targetAvg = breeds?.reduce((sum, b) => sum + b.count * b.averageProduction, 0) ?? 0;

  // Build SVG path
  const barWidth = Math.max((CHART_WIDTH - 8) / data.length - 2, 2);
  const barGap = (CHART_WIDTH - barWidth * data.length) / (data.length + 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Egg Production</Text>
        <View style={styles.rangeSelector}>
          {([7, 15, 30] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeButton, selectedRange === r && styles.rangeButtonActive]}
              onPress={() => setSelectedRange(r)}
            >
              <Text style={[styles.rangeButtonText, selectedRange === r && styles.rangeButtonTextActive]}>
                {r}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((d, i) => {
            const barHeight = maxCount > 0 ? (d.count / maxCount) * (CHART_HEIGHT - 20) : 0;
            const x = barGap + i * (barWidth + barGap);
            return (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    left: x,
                    width: barWidth,
                    height: Math.max(barHeight, 2),
                    bottom: 0,
                    backgroundColor: d.count > 0 ? colors.secondary : colors.gray[200],
                  },
                ]}
              />
            );
          })}
          {/* Target line */}
          {targetAvg > 0 && (
            <View
              style={[
                styles.targetLine,
                { bottom: (targetAvg / maxCount) * (CHART_HEIGHT - 20) },
              ]}
            />
          )}
        </View>
        {/* X-axis labels */}
        <View style={styles.xAxis}>
          <Text style={styles.xLabel}>{format(days[0], "M/d")}</Text>
          {days.length > 2 && (
            <Text style={styles.xLabel}>{format(days[Math.floor(days.length / 2)], "M/d")}</Text>
          )}
          <Text style={styles.xLabel}>{format(days[days.length - 1], "M/d")}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{avgPerDay.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Daily Avg</Text>
        </View>
        {targetAvg > 0 && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{targetAvg.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Target Avg</Text>
          </View>
        )}
        {thisWeekAvg && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{thisWeekAvg.avg?.toFixed(1) ?? "0"}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        )}
        {lastWeekAvg && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{lastWeekAvg.avg?.toFixed(1) ?? "0"}</Text>
            <Text style={styles.statLabel}>Last Week</Text>
          </View>
        )}
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
  rangeButtonActive: { backgroundColor: colors.primary },
  rangeButtonText: { fontSize: 12, color: colors.gray[600] },
  rangeButtonTextActive: { color: colors.white },
  chartContainer: { marginBottom: 12 },
  chart: { height: CHART_HEIGHT, position: "relative" },
  bar: { position: "absolute", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  targetLine: { position: "absolute", left: 0, right: 0, height: 1, borderTopWidth: 1, borderTopColor: colors.gray[400], borderStyle: "dashed" },
  xAxis: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  xLabel: { fontSize: 10, color: colors.gray[400] },
  statsRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: colors.primary },
  statLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
});
