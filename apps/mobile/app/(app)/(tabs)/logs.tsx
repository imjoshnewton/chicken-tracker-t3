import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import { format } from "date-fns";
import { trpc } from "../../../lib/trpc";
import { colors } from "../../../constants/Colors";

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
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Text style={styles.count}>{item.count}</Text>
          <Text style={styles.countLabel}>eggs</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.date}>{format(new Date(item.date), "MMM d, yyyy")}</Text>
          {item.notes ? <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text> : null}
        </View>
      </View>
    </Swipeable>
  );
}

export default function LogsScreen() {
  const [page, setPage] = React.useState(1);
  const { data: logs, isLoading, refetch, isRefetching } = trpc.logs.getLogs.useQuery({ page });
  const utils = trpc.useContext();

  const deleteLog = trpc.logs.deleteLog.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.logs.getLogs.invalidate();
      utils.stats.getStats.invalidate();
    },
  });

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteLog.mutate({ id });
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <SwipeableLogRow item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No egg logs yet</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  list: { padding: 16, gap: 8 },
  row: { backgroundColor: colors.white, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowLeft: { alignItems: "center", marginRight: 16, minWidth: 48 },
  count: { fontSize: 24, fontWeight: "700", color: colors.primary },
  countLabel: { fontSize: 12, color: colors.gray[400] },
  rowRight: { flex: 1 },
  date: { fontSize: 15, fontWeight: "500", color: colors.gray[800] },
  notes: { fontSize: 13, color: colors.gray[500], marginTop: 2 },
  deleteAction: { backgroundColor: "#dc2626", justifyContent: "center", alignItems: "center", width: 80, borderRadius: 12, marginLeft: 8 },
  deleteActionText: { color: colors.white, fontWeight: "600", fontSize: 14 },
  empty: { alignItems: "center", paddingTop: 64 },
  emptyText: { fontSize: 16, color: colors.gray[400] },
});
