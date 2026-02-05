import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import { format } from "date-fns";
import { trpc } from "../../../lib/trpc";
import { colors } from "../../../constants/Colors";

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function SwipeableExpenseRow({ item, onDelete }: { item: any; onDelete: (id: string) => void }) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        swipeableRef.current?.close();
        Alert.alert("Delete Expense", `Delete ${formatCurrency(item.amount)} expense?`, [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
        ]);
      }}
    >
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{format(new Date(item.date), "MMM d, yyyy")}</Text>
          {item.memo ? <Text style={styles.memo} numberOfLines={1}>{item.memo}</Text> : null}
        </View>
      </View>
    </Swipeable>
  );
}

export default function ExpensesScreen() {
  const [page, setPage] = React.useState(1);
  const { data: expenses, isLoading, refetch, isRefetching } = trpc.expenses.getExpenses.useQuery({ page });
  const utils = trpc.useContext();

  const deleteExpense = trpc.expenses.deleteExpense.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.expenses.getExpenses.invalidate();
      utils.stats.getExpenseStats.invalidate();
    },
  });

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteExpense.mutate({ id });
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <SwipeableExpenseRow item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No expenses yet</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  list: { padding: 16, gap: 8 },
  row: { backgroundColor: colors.white, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowLeft: { marginRight: 16, minWidth: 80 },
  amount: { fontSize: 18, fontWeight: "700", color: colors.tertiary },
  rowRight: { flex: 1 },
  category: { fontSize: 15, fontWeight: "500", color: colors.gray[800] },
  date: { fontSize: 13, color: colors.gray[500], marginTop: 2 },
  memo: { fontSize: 13, color: colors.gray[400], marginTop: 2 },
  deleteAction: { backgroundColor: "#dc2626", justifyContent: "center", alignItems: "center", width: 80, borderRadius: 12, marginLeft: 8 },
  deleteActionText: { color: colors.white, fontWeight: "600", fontSize: 14 },
  empty: { alignItems: "center", paddingTop: 64 },
  emptyText: { fontSize: 16, color: colors.gray[400] },
});
