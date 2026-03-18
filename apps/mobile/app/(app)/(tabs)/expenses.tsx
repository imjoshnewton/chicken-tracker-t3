import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { trpc } from "../../../lib/trpc";
import { colors } from "../../../constants/Colors";
import { showErrorToast } from "../../../lib/toast";
import LogExpenseModal from "../../../components/LogExpenseModal";

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function SwipeableExpenseRow({ item, onDelete }: { item: any; onDelete: (id: string) => void }) {
  const swipeableRef = React.useRef<Swipeable>(null);
  const [showMemo, setShowMemo] = React.useState(false);

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
      <Ionicons name="trash-outline" size={22} color={colors.white} />
    </TouchableOpacity>
  );

  const expDate = new Date(item.date);

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.row} accessibilityLabel={`${formatCurrency(item.amount)} ${item.category} expense`} accessibilityActions={[{ name: "delete", label: "Delete" }]} onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === "delete") onDelete(item.id); }}>
        <View style={styles.rowLeft}>
          <Text style={styles.dayNum}>{format(expDate, "d")}</Text>
          <Text style={styles.monthLabel}>{format(expDate, "MMM")}</Text>
        </View>
        <View style={styles.rowMiddle}>
          <Text style={styles.category}>{item.category}</Text>
          {item.memo ? (
            showMemo ? (
              <Text style={styles.memo}>{item.memo}</Text>
            ) : (
              <TouchableOpacity onPress={() => setShowMemo(true)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.showMore}>show more</Text>
              </TouchableOpacity>
            )
          ) : null}
        </View>
        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
      </View>
    </Swipeable>
  );
}

export default function ExpensesScreen() {
  const [showLogExpense, setShowLogExpense] = React.useState(false);
  const { data: flocks } = trpc.flocks.getFlocks.useQuery();
  const utils = trpc.useContext();

  const {
    data,
    isLoading,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = trpc.expenses.getExpenses.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length >= 25 ? allPages.length + 1 : undefined,
      initialCursor: 1,
    },
  );

  const allExpenses = data?.pages.flatMap((page) => page) ?? [];

  const defaultFlock = flocks?.[0];

  const deleteExpense = trpc.expenses.deleteExpense.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.expenses.getExpenses.invalidate();
      utils.stats.getExpenseStats.invalidate();
    },
    onError: () => showErrorToast("Failed to delete expense"),
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
        data={allExpenses}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />}
        contentContainerStyle={[styles.list, { paddingBottom: 80 }]}
        renderItem={({ item }) => <SwipeableExpenseRow item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No expenses yet</Text></View>}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.primary} /> : null}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowLogExpense(true)} activeOpacity={0.8} accessibilityLabel="Log expense" accessibilityRole="button">
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>
      {defaultFlock && (
        <LogExpenseModal
          visible={showLogExpense}
          onClose={() => setShowLogExpense(false)}
          flockId={defaultFlock.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  list: { padding: 16, gap: 8 },
  row: { backgroundColor: colors.white, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowLeft: { alignItems: "center", marginRight: 16, minWidth: 44 },
  dayNum: { fontSize: 22, fontWeight: "700", color: colors.gray[700] },
  monthLabel: { fontSize: 12, color: colors.text.muted, textTransform: "uppercase" },
  rowMiddle: { flex: 1 },
  category: { fontSize: 15, fontWeight: "500", color: colors.gray[800], textTransform: "capitalize" },
  amount: { fontSize: 20, fontWeight: "700", color: colors.text.tertiary },
  memo: { fontSize: 13, color: colors.gray[400], marginTop: 4 },
  showMore: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  deleteAction: { backgroundColor: "#dc2626", justifyContent: "center", alignItems: "center", width: 80, borderRadius: 12, marginLeft: 8 },
  empty: { alignItems: "center", paddingTop: 64 },
  emptyText: { fontSize: 16, color: colors.text.muted },
  fab: { position: "absolute", bottom: 24, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.tertiary, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  fabPlus: { color: colors.white, fontSize: 30, fontWeight: "300", marginTop: -2 },
});
