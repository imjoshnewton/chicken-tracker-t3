import React from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, Animated } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import { subDays, startOfDay } from "date-fns";
import * as Haptics from "expo-haptics";
import { trpc } from "../../../../lib/trpc";
import { colors } from "../../../../constants/Colors";
import { showErrorToast } from "../../../../lib/toast";
import LogEggsModal from "../../../../components/LogEggsModal";
import LogExpenseModal from "../../../../components/LogExpenseModal";
import ProductionChart from "../../../../components/ProductionChart";
import ExpenseChart from "../../../../components/ExpenseChart";
import BreedFormModal from "../../../../components/BreedFormModal";
import EditTaskModal from "../../../../components/EditTaskModal";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function FlockDetailScreen() {
  const { flockId } = useLocalSearchParams<{ flockId: string }>();
  const router = useRouter();

  const [showLogEggs, setShowLogEggs] = React.useState(false);
  const [showLogExpense, setShowLogExpense] = React.useState(false);
  const [showBreedForm, setShowBreedForm] = React.useState(false);
  const [editingBreed, setEditingBreed] = React.useState<any>(null);
  const [expenseMonths, setExpenseMonths] = React.useState(6);
  const [editingTask, setEditingTask] = React.useState<any>(null);
  const [fabOpen, setFabOpen] = React.useState(false);
  const fabAnim = React.useRef(new Animated.Value(0)).current;

  const openFab = () => {
    setFabOpen(true);
    Animated.spring(fabAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }).start();
  };
  const closeFab = (cb?: () => void) => {
    Animated.timing(fabAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setFabOpen(false);
      cb?.();
    });
  };

  const today = startOfDay(new Date());
  const range = { from: subDays(today, 30), to: today };

  const { data: flock, isLoading: flockLoading, refetch: refetchFlock } = trpc.flocks.getFlock.useQuery(
    { flockId: flockId! },
    { enabled: !!flockId }
  );

  const { data: stats, isLoading: statsLoading } = trpc.stats.getStats.useQuery(
    { flockId: flockId!, range, today, breedFilter: null },
    { enabled: !!flockId }
  );

  const { data: expenseStats } = trpc.stats.getExpenseStats.useQuery(
    { flockId: flockId!, today, numMonths: expenseMonths },
    { enabled: !!flockId }
  );

  const isLoading = flockLoading || statsLoading;
  const [refreshing, setRefreshing] = React.useState(false);
  const breeds = flock?.breeds?.filter((b: any) => !b.deleted) ?? [];

  const markComplete = trpc.tasks.markComplete.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetchFlock();
    },
    onError: () => showErrorToast("Failed to update task"),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchFlock();
    setRefreshing(false);
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!flock) {
    return <View style={styles.center}><Text style={styles.errorText}>Flock not found</Text></View>;
  }

  // Calculate basic stats from the stats response
  const logs = stats?.getLogs ?? [];
  const todayCount = logs.filter((l: any) => {
    const logDate = new Date(l.date);
    return logDate.toDateString() === today.toDateString();
  }).reduce((sum: number, l: any) => sum + l.count, 0);

  const totalEggs = logs.reduce((sum: number, l: any) => sum + l.count, 0);

  // Calculate total expenses
  const totalExpenses = expenseStats?.expenses?.reduce((sum: number, e: any) => sum + e.total, 0) ?? 0;

  return (
    <>
      <Stack.Screen options={{ title: flock.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {flock.imageUrl ? (
          <View style={styles.heroContainer}>
            <Image source={{ uri: flock.imageUrl }} style={styles.heroImage} contentFit="cover" />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>{flock.name}</Text>
            </View>
          </View>
        ) : null}

        {flock.description ? (
          <View style={styles.header}>
            <Text style={styles.description}>{flock.description}</Text>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <StatCard label="Today" value={todayCount} />
          <StatCard label="30-Day Total" value={totalEggs} />
          <StatCard label="Breeds" value={breeds.length} />
          <StatCard label="Expenses (6mo)" value={`$${totalExpenses.toFixed(0)}`} />
        </View>

        {/* Production Chart */}
        <ProductionChart
          logs={logs}
          range={range}
          thisWeekAvg={stats?.thisWeeksAvg}
          lastWeekAvg={stats?.lastWeeksAvg}
          breeds={breeds}
        />

        {/* Expense Chart */}
        <ExpenseChart
          expenses={expenseStats?.expenses ?? []}
          production={expenseStats?.production ?? []}
          numMonths={expenseMonths}
          onMonthsChange={setExpenseMonths}
        />

        {/* Tasks Section */}
        {flock.tasks && flock.tasks.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            {flock.tasks.slice(0, 5).map((task: any) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskRow}
                onPress={() => {
                  if (!task.completed) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    markComplete.mutate({ id: task.id, recurrence: task.recurrence ?? "" });
                  }
                }}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  setEditingTask(task);
                }}
                activeOpacity={task.completed ? 1 : 0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: !!task.completed }}
                accessibilityLabel={task.title}
              >
                <View style={[styles.taskCheck, task.completed && styles.taskCheckCompleted]}>
                  {task.completed ? <Text style={styles.taskCheckIcon}>✓</Text> : null}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
                  {task.dueDate ? (
                    <Text style={styles.taskDue}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Breeds Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breeds</Text>
          {breeds.length > 0 ? breeds.map((breed: any) => (
            <TouchableOpacity key={breed.id} style={styles.breedRow} onPress={() => { setEditingBreed(breed); setShowBreedForm(true); }}>
              {breed.imageUrl ? (
                <Image source={{ uri: breed.imageUrl }} style={styles.breedImage} contentFit="cover" />
              ) : (
                <View style={[styles.breedImage, styles.breedImagePlaceholder]}><Text>🐓</Text></View>
              )}
              <View style={styles.breedInfo}>
                <Text style={styles.breedName}>{breed.name || breed.breed}</Text>
                <Text style={styles.breedCount}>{breed.count} birds</Text>
                {breed.averageProduction > 0 ? (
                  <Text style={styles.breedProd}>{breed.averageProduction} eggs/day avg</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={styles.emptyBreeds}>No breeds added yet</Text>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      {fabOpen && (
        <View style={styles.fabOverlay}>
          <Animated.View style={[styles.fabOverlayBg, { opacity: fabAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => closeFab()} />
          </Animated.View>
          <View style={styles.fabMenu}>
            {[
              { label: "Log Eggs", icon: "🥚", onPress: () => closeFab(() => setShowLogEggs(true)) },
              { label: "Log Expense", icon: "💰", onPress: () => closeFab(() => setShowLogExpense(true)) },
              { label: "Add Breed", icon: "🐓", onPress: () => closeFab(() => { setEditingBreed(null); setShowBreedForm(true); }) },
              { label: "Edit Flock", icon: "✏️", onPress: () => closeFab(() => router.push(`/(app)/flocks/${flockId}/edit`)) },
            ].map((item, i, arr) => {
              const reverseIndex = arr.length - i;
              const translateY = fabAnim.interpolate({ inputRange: [0, 1], outputRange: [reverseIndex * 70, 0] });
              const opacity = fabAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
              const scale = fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
              return (
                <Animated.View key={i} style={[styles.fabMenuItem, { opacity, transform: [{ translateY }, { scale }] }]}>
                  <TouchableOpacity style={styles.fabMenuItemTouchable} onPress={item.onPress}>
                    <Text style={styles.fabMenuLabel}>{item.label}</Text>
                    <View style={styles.fabMenuIcon}>
                      <Text style={styles.fabMenuIconText}>{item.icon}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
            <Animated.View style={{ opacity: fabAnim, transform: [{ rotate: fabAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }}>
              <TouchableOpacity style={styles.fabClose} onPress={() => closeFab()}>
                <Text style={styles.fabCloseText}>✕</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}
      {!fabOpen && (
        <TouchableOpacity style={styles.fab} onPress={openFab} activeOpacity={0.8} accessibilityLabel="Actions" accessibilityRole="button">
          <Text style={styles.fabPlus}>+</Text>
        </TouchableOpacity>
      )}

      {/* Modals */}
      <LogEggsModal
        visible={showLogEggs}
        onClose={() => setShowLogEggs(false)}
        flockId={flockId!}
        breeds={breeds}
      />
      <LogExpenseModal
        visible={showLogExpense}
        onClose={() => setShowLogExpense(false)}
        flockId={flockId!}
      />
      <BreedFormModal
        visible={showBreedForm}
        onClose={() => { setShowBreedForm(false); setEditingBreed(null); }}
        flockId={flockId!}
        breed={editingBreed}
      />
      <EditTaskModal
        visible={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  errorText: { fontSize: 16, color: colors.text.muted },
  heroContainer: { position: "relative" },
  heroImage: { width: "100%", height: 200 },
  heroOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  heroTitle: { fontSize: 28, fontWeight: "700", color: colors.white },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  description: { fontSize: 15, color: colors.gray[500] },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  statCard: { flex: 1, minWidth: "45%", backgroundColor: colors.white, borderRadius: 12, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: "700", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.gray[500], marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: colors.gray[900], marginBottom: 12 },
  emptyBreeds: { fontSize: 14, color: colors.text.muted, textAlign: "center", paddingVertical: 16 },
  taskRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
  taskCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.gray[300], justifyContent: "center", alignItems: "center", marginRight: 12 },
  taskCheckCompleted: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  taskCheckIcon: { color: colors.white, fontSize: 14, fontWeight: "700" },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: "500", color: colors.gray[800] },
  taskTitleCompleted: { textDecorationLine: "line-through", color: colors.gray[400] },
  taskDue: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  breedRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
  breedImage: { width: 48, height: 48, borderRadius: 24 },
  breedImagePlaceholder: { backgroundColor: colors.gray[100], justifyContent: "center", alignItems: "center" },
  breedInfo: { marginLeft: 12, flex: 1 },
  breedName: { fontSize: 15, fontWeight: "500", color: colors.gray[800] },
  breedCount: { fontSize: 13, color: colors.gray[500] },
  breedProd: { fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  fabOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  fabOverlayBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)" },
  fabMenu: { position: "absolute", bottom: 40, right: 20, alignItems: "flex-end", gap: 16 },
  fabMenuItem: {},
  fabMenuItemTouchable: { flexDirection: "row", alignItems: "center", gap: 14 },
  fabMenuLabel: { fontSize: 16, fontWeight: "500", color: colors.white },
  fabMenuIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  fabMenuIconText: { fontSize: 22 },
  fabClose: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", marginTop: 8 },
  fabCloseText: { fontSize: 26, color: colors.white, fontWeight: "300" },
  fab: { position: "absolute", bottom: 24, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, zIndex: 50 },
  fabPlus: { color: colors.white, fontSize: 30, fontWeight: "300", marginTop: -2 },
});
