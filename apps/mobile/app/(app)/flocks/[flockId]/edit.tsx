import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "../../../../lib/trpc";
import { colors } from "../../../../constants/Colors";

const FLOCK_TYPES = [
  { value: "chickens", label: "Chickens" },
  { value: "ducks", label: "Ducks" },
  { value: "quail", label: "Quail" },
  { value: "other", label: "Other" },
];

export default function FlockEditScreen() {
  const { flockId } = useLocalSearchParams<{ flockId: string }>();
  const router = useRouter();

  const { data: flock, isLoading } = trpc.flocks.getFlock.useQuery(
    { flockId: flockId! },
    { enabled: !!flockId }
  );

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("chickens");
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (flock && !initialized) {
      setName(flock.name);
      setDescription(flock.description || "");
      setType(flock.type || "chickens");
      setImageUrl(flock.image || null);
      setInitialized(true);
    }
  }, [flock, initialized]);

  const utils = trpc.useContext();
  const updateFlock = trpc.flocks.updateFlock.useMutation({
    onSuccess: () => {
      utils.flocks.getFlocks.invalidate();
      utils.flocks.getFlock.invalidate({ flockId: flockId! });
      router.back();
    },
  });

  const handleSave = () => {
    if (!name.trim()) return;
    updateFlock.mutate({
      id: flockId!,
      name: name.trim(),
      description: description.trim(),
      type,
      imageUrl,
    });
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!flock) {
    return <View style={styles.center}><Text style={styles.errorText}>Flock not found</Text></View>;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Flock" }} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Flock Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Flock name"
            placeholderTextColor={colors.gray[400]}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your flock..."
            placeholderTextColor={colors.gray[400]}
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeSelector}>
            {FLOCK_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, type === t.value && styles.typeChipActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!name.trim() || updateFlock.isLoading}
          >
            {updateFlock.isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  errorText: { fontSize: 16, color: colors.gray[400] },
  form: { flex: 1 },
  formContent: { padding: 16, gap: 8 },
  imageContainer: { borderRadius: 16, overflow: "hidden", marginBottom: 8 },
  image: { width: "100%", height: 200 },
  imagePlaceholder: { width: "100%", height: 200, backgroundColor: colors.gray[100], justifyContent: "center", alignItems: "center", borderRadius: 16 },
  imagePlaceholderText: { fontSize: 16, color: colors.gray[400] },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginTop: 8 },
  input: { backgroundColor: colors.white, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.gray[200], color: colors.gray[900] },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  typeSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontSize: 14, color: colors.gray[700] },
  typeChipTextActive: { color: colors.white },
  footer: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  saveButton: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
});
