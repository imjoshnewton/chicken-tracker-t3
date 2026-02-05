import React from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import { subDays, startOfDay } from "date-fns";
import { trpc } from "../../../../lib/trpc";
import { colors } from "../../../../constants/Colors";
import LogEggsModal from "../../../../components/LogEggsModal";
import LogExpenseModal from "../../../../components/LogExpenseModal";
import ProductionChart from "../../../../components/ProductionChart";
import ExpenseChart from "../../../../components/ExpenseChart";
import BreedFormModal from "../../../../components/BreedFormModal";

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
  const todayCount = stats?.logs?.filter((l: any) => {
    const logDate = new Date(l.date);
    return logDate.toDateString() === today.toDateString();
  }).reduce((sum: number, l: any) => sum + l.count, 0) ?? 0;

  const totalEggs = stats?.logs?.reduce((sum: number, l: any) => sum + l.count, 0) ?? 0;

  // Calculate total expenses
  const totalExpenses = expenseStats?.expenses?.reduce((sum: number, e: any) => sum + e.total, 0) ?? 0;

  return (
    <>
      <Stack.Screen options={{ title: flock.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {flock.image ? <Image source={{ uri: flock.image }} style={styles.heroImage} contentFit="cover" /> : null}

        <View style={styles.header}>
          <Text style={styles.title}>{flock.name}</Text>
          {flock.description ? <Text style={styles.description}>{flock.description}</Text> : null}
          <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/(app)/flocks/${flockId}/edit`)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Today" value={todayCount} />
          <StatCard label="30-Day Total" value={totalEggs} />
          <StatCard label="Breeds" value={breeds.length} />
          <StatCard label="Expenses (6mo)" value={`$${totalExpenses.toFixed(0)}`} />
        </View>

        {/* Production Chart */}
        {stats?.logs && stats.logs.length > 0 ? (
          <ProductionChart
            logs={stats.logs}
            range={range}
            thisWeekAvg={stats.thisWeeksAvg}
            lastWeekAvg={stats.lastWeeksAvg}
            breeds={breeds}
          />
        ) : null}

        {/* Expense Chart */}
        {expenseStats?.expenses && expenseStats.expenses.length > 0 ? (
          <ExpenseChart
            expenses={expenseStats.expenses}
            production={expenseStats.production}
            numMonths={expenseMonths}
            onMonthsChange={setExpenseMonths}
          />
        ) : null}

        {/* Tasks Section */}
        {flock.tasks && flock.tasks.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            {flock.tasks.slice(0, 5).map((task: any) => (
              <View key={task.id} style={styles.taskRow}>
                <View style={[styles.taskCheck, task.completed && styles.taskCheckCompleted]}>
                  {task.completed ? <Text style={styles.taskCheckIcon}>✓</Text> : null}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
                  {task.dueDate ? (
                    <Text style={styles.taskDue}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Breeds Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Breeds</Text>
            <TouchableOpacity style={styles.addBreedButton} onPress={() => { setEditingBreed(null); setShowBreedForm(true); }}>
              <Text style={styles.addBreedButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
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

      {/* FABs */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setShowLogEggs(true)}>
          <Text style={styles.fabIcon}>🥚</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.tertiary }]} onPress={() => setShowLogExpense(true)}>
          <Text style={styles.fabIcon}>💰</Text>
        </TouchableOpacity>
      </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  errorText: { fontSize: 16, color: colors.gray[400] },
  heroImage: { width: "100%", height: 200 },
  header: { padding: 16 },
  title: { fontSize: 28, fontWeight: "700", color: colors.gray[900] },
  description: { fontSize: 15, color: colors.gray[500], marginTop: 4 },
  editButton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.gray[100], borderRadius: 8, alignSelf: "flex-start" },
  editButtonText: { fontSize: 14, color: colors.primary, fontWeight: "500" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  statCard: { flex: 1, minWidth: "45%", backgroundColor: colors.white, borderRadius: 12, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: "700", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.gray[500], marginTop: 4 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: colors.gray[900] },
  addBreedButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.secondary, borderRadius: 16 },
  addBreedButtonText: { fontSize: 13, fontWeight: "500", color: colors.white },
  emptyBreeds: { fontSize: 14, color: colors.gray[400], textAlign: "center", paddingVertical: 16 },
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
  breedProd: { fontSize: 12, color: colors.secondary, marginTop: 1 },
  fabContainer: { position: "absolute", bottom: 24, right: 16, gap: 12 },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  fabIcon: { fontSize: 24 },
});
