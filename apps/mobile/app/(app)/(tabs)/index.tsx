import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { trpc } from "../../../lib/trpc";
import { colors } from "../../../constants/Colors";
import AddFlockModal from "../../../components/AddFlockModal";

export default function FlocksScreen() {
  const router = useRouter();
  const [showAddFlock, setShowAddFlock] = React.useState(false);
  const { data: flocks, isLoading, refetch, isRefetching } = trpc.flocks.getFlocks.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={flocks}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/flocks/${item.id}`)} activeOpacity={0.7}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <Text style={styles.placeholderEmoji}>🐔</Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.description ? <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No flocks yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first flock</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddFlock(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <AddFlockModal visible={showAddFlock} onClose={() => setShowAddFlock(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardImage: { width: "100%", height: 160 },
  cardImagePlaceholder: { backgroundColor: colors.gray[100], justifyContent: "center", alignItems: "center" },
  placeholderEmoji: { fontSize: 48 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: colors.gray[900] },
  cardDescription: { fontSize: 14, color: colors.gray[500], marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 64 },
  emptyText: { fontSize: 18, fontWeight: "600", color: colors.gray[400] },
  emptySubtext: { fontSize: 14, color: colors.gray[400], marginTop: 8 },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  fabText: { color: colors.white, fontSize: 28, fontWeight: "300", marginTop: -2 },
});
