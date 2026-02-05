import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="flocks/[flockId]/index"
        options={{ title: "Flock Details" }}
      />
      <Stack.Screen
        name="flocks/[flockId]/edit"
        options={{ title: "Edit Flock" }}
      />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
    </Stack>
  );
}
