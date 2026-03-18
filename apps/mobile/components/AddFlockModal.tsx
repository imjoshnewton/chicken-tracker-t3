import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { trpc } from "../lib/trpc";
import { colors } from "../constants/Colors";
import { showErrorToast } from "../lib/toast";

const FLOCK_TYPES = [
  { value: "chickens", label: "Chickens" },
  { value: "ducks", label: "Ducks" },
  { value: "quail", label: "Quail" },
  { value: "other", label: "Other" },
];

interface AddFlockModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddFlockModal({ visible, onClose }: AddFlockModalProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("chickens");

  const utils = trpc.useContext();
  const createFlock = trpc.flocks.createFlock.useMutation({
    onSuccess: () => {
      utils.flocks.getFlocks.invalidate();
      resetForm();
      onClose();
    },
    onError: () => showErrorToast("Failed to create flock"),
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("chickens");
  };

  React.useEffect(() => {
    if (!visible) resetForm();
  }, [visible]);

  const handleSubmit = () => {
    if (!name.trim()) { showErrorToast("Enter a flock name"); return; }
    createFlock.mutate({
      name: name.trim(),
      description: description.trim(),
      type,
      imageUrl: null,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Cancel" accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Flock</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!name.trim() || createFlock.isLoading} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Create flock" accessibilityRole="button" accessibilityState={{ disabled: !name.trim() || createFlock.isLoading }}>
            <Text style={[styles.headerAction, (!name.trim() || createFlock.isLoading) && { opacity: 0.4 }]}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Flock Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Backyard Flock"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.gray[400]}
            autoFocus
            accessibilityLabel="Flock name"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="Describe your flock..."
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={colors.gray[400]}
            accessibilityLabel="Description"
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeSelector}>
            {FLOCK_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, type === t.value && styles.typeChipActive]}
                onPress={() => setType(t.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: type === t.value }}
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
            style={[styles.submitButton, !name.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!name.trim() || createFlock.isLoading}
            accessibilityLabel="Create flock"
            accessibilityRole="button"
            accessibilityState={{ disabled: !name.trim() || createFlock.isLoading }}
          >
            {createFlock.isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Create Flock</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  cancelText: { fontSize: 16, color: colors.primary },
  headerTitle: { fontSize: 18, fontWeight: "600", color: colors.gray[900] },
  headerAction: { fontSize: 16, fontWeight: "600", color: colors.primary },
  form: { flex: 1 },
  formContent: { padding: 16, gap: 8 },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginTop: 8 },
  input: { backgroundColor: colors.white, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.gray[200], color: colors.gray[900] },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  typeSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontSize: 14, color: colors.gray[700] },
  typeChipTextActive: { color: colors.white },
  footer: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  submitButton: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
});
