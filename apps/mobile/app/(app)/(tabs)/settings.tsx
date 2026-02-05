import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { trpc } from "../../../lib/trpc";
import { colors } from "../../../constants/Colors";

function MenuItem({ icon, label, onPress, badge }: { icon: string; label: string; onPress: () => void; badge?: number }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <FontAwesome name={icon as any} size={18} color={colors.gray[600]} style={styles.menuIcon} />
      <Text style={styles.menuText}>{label}</Text>
      <View style={styles.menuRight}>
        {badge ? (
          <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
        ) : null}
        <FontAwesome name="chevron-right" size={14} color={colors.gray[300]} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const { data: unread } = trpc.auth.getUserUnreadNotifications.useQuery();
  const unreadCount = unread?.length ?? 0;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || "?"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName || user?.emailAddresses[0]?.emailAddress || "User"}</Text>
        <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>
      </View>

      <View style={styles.section}>
        <MenuItem
          icon="bell"
          label="Notifications"
          onPress={() => router.push("/(app)/notifications")}
          badge={unreadCount}
        />
        <MenuItem icon="info-circle" label="About" onPress={() => {}} />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.6}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  profileCard: { backgroundColor: colors.white, borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: colors.white, fontSize: 28, fontWeight: "600", textTransform: "uppercase" },
  name: { fontSize: 20, fontWeight: "600", color: colors.gray[900] },
  email: { fontSize: 14, color: colors.gray[500], marginTop: 4 },
  section: { backgroundColor: colors.white, borderRadius: 16, overflow: "hidden", marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  menuIcon: { width: 28 },
  menuText: { flex: 1, fontSize: 16, color: colors.gray[800] },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { backgroundColor: colors.accent1, borderRadius: 10, minWidth: 20, height: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 6 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  signOutButton: { backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  signOutText: { color: colors.accent1, fontSize: 16, fontWeight: "600" },
});
