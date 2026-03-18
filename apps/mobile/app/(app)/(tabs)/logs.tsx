import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { trpc } from "../../../lib/trpc";
import { colors } from "../../../constants/Colors";
import { showErrorToast } from "../../../lib/toast";
import LogEggsModal from "../../../components/LogEggsModal";

function SwipeableLogRow({ item, onDelete }: { item: any; onDelete: (id: string) => void }) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        swipeableRef.current?.close();
        Alert.alert("Delete Log", `Delete ${item.count} egg log from ${format(new Date(item.date), "MMM d")}?`, [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
        ]);
      }}
    >
      <Ionicons name="trash-outline" size={22} color={colors.white} />
    </TouchableOpacity>
  );

  const logDate = new Date(item.date);

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.row} accessibilityLabel={`${item.count} eggs on ${format(logDate, "MMMM d")}`} accessibilityActions={[{ name: "delete", label: "Delete" }]} onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === "delete") onDelete(item.id); }}>
        <View style={styles.rowLeft}>
          <Text style={styles.dayNum}>{format(logDate, "d")}</Text>
          <Text style={styles.monthLabel}>{format(logDate, "MMM")}</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.count}>{item.count} eggs</Text>
        </View>
      </View>
    </Swipeable>
  );
}

export default function LogsScreen() {
  const [page, setPage] = React.useState(1);
  const [allLogs, setAllLogs] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [showLogEggs, setShowLogEggs] = React.useState(false);
  const { data: logs, isLoading, refetch, isRefetching, isFetching } = trpc.logs.getLogs.useQuery({ page }, {
    onSuccess: (data) => {
      if (page === 1) {
        setAllLogs(data ?? []);
      } else {
        setAllLogs((prev) => [...prev, ...(data ?? [])]);
      }
      setHasMore((data?.length ?? 0) >= 20);
    },
  });
  const { data: flocks } = trpc.flocks.getFlocks.useQuery();
  const utils = trpc.useContext();

  const defaultFlock = flocks?.[0];
  const breeds = defaultFlock?.breeds?.filter((b: any) => !b.deleted) ?? [];

  const deleteLog = trpc.logs.deleteLog.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.logs.getLogs.invalidate();
      utils.stats.getStats.invalidate();
      setPage(1);
      setAllLogs([]);
      setHasMore(true);
    },
    onError: () => showErrorToast("Failed to delete log"),
  });

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteLog.mutate({ id });
  };

  const handleRefresh = () => {
    setPage(1);
    setAllLogs([]);
    setHasMore(true);
    refetch();
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  if (isLoading && page === 1) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={allLogs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />}
        contentContainerStyle={[styles.list, { paddingBottom: 80 }]}
        renderItem={({ item }) => <SwipeableLogRow item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No egg logs yet</Text></View>}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetching && page > 1 ? <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.primary} /> : null}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowLogEggs(true)} activeOpacity={0.8} accessibilityLabel="Log eggs" accessibilityRole="button">
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>
      {defaultFlock && (
        <LogEggsModal
          visible={showLogEggs}
          onClose={() => setShowLogEggs(false)}
          flockId={defaultFlock.id}
          breeds={breeds}
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
  rowRight: { flex: 1, alignItems: "flex-end", justifyContent: "center" },
  count: { fontSize: 20, fontWeight: "700", color: colors.text.tertiary },
  deleteAction: { backgroundColor: "#dc2626", justifyContent: "center", alignItems: "center", width: 80, borderRadius: 12, marginLeft: 8 },
  empty: { alignItems: "center", paddingTop: 64 },
  emptyText: { fontSize: 16, color: colors.text.muted },
  fab: { position: "absolute", bottom: 24, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  fabPlus: { color: colors.white, fontSize: 30, fontWeight: "300", marginTop: -2 },
});
