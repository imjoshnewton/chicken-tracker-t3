import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "../../lib/trpc";
import { colors } from "../../constants/Colors";

export default function NotificationsScreen() {
  const { data: notifications, isLoading, refetch, isRefetching } = trpc.auth.getUserNotifications.useQuery();
  const utils = trpc.useContext();

  const markAsRead = trpc.auth.markNotificationasRead.useMutation({
    onSuccess: () => {
      utils.auth.getUserNotifications.invalidate();
      utils.auth.getUserUnreadNotifications.invalidate();
    },
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Notifications" }} />
      <View style={styles.container}>
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, !item.read && styles.rowUnread]}
              onPress={() => {
                if (!item.read) markAsRead.mutate({ id: item.id });
              }}
              activeOpacity={item.read ? 1 : 0.7}
            >
              <View style={styles.rowContent}>
                {!item.read ? <View style={styles.unreadDot} /> : null}
                <View style={styles.textContent}>
                  <Text style={[styles.message, !item.read && styles.messageUnread]}>{item.message}</Text>
                  <Text style={styles.time}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  list: { padding: 16, gap: 8 },
  row: { backgroundColor: colors.white, borderRadius: 12, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowUnread: { backgroundColor: "#f0f7ff" },
  rowContent: { flexDirection: "row", alignItems: "flex-start" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, marginRight: 10 },
  textContent: { flex: 1 },
  message: { fontSize: 15, color: colors.gray[600], lineHeight: 20 },
  messageUnread: { color: colors.gray[900], fontWeight: "500" },
  time: { fontSize: 12, color: colors.gray[400], marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 64 },
  emptyText: { fontSize: 16, color: colors.gray[400] },
});
