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
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { startOfDay } from "date-fns";
import { trpc } from "../lib/trpc";
import { colors } from "../constants/Colors";

interface Breed {
  id: string;
  name: string | null;
  breed: string;
  averageProduction: number;
}

interface LogEggsModalProps {
  visible: boolean;
  onClose: () => void;
  flockId: string;
  breeds: Breed[];
}

export default function LogEggsModal({ visible, onClose, flockId, breeds }: LogEggsModalProps) {
  const [date, setDate] = React.useState(new Date());
  const [count, setCount] = React.useState(0);
  const [breedId, setBreedId] = React.useState<string | undefined>(undefined);
  const [notes, setNotes] = React.useState("");
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const utils = trpc.useContext();
  const createLog = trpc.logs.createLog.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.logs.getLogs.invalidate();
      utils.stats.getStats.invalidate();
      utils.flocks.getFlock.invalidate();
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setDate(new Date());
    setCount(0);
    setBreedId(undefined);
    setNotes("");
    setShowDatePicker(false);
  };

  const handleSubmit = () => {
    if (count <= 0) return;
    createLog.mutate({
      flockId,
      date: startOfDay(date),
      count,
      breedId,
      notes: notes || undefined,
    });
  };

  const increment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount((c) => c + 1);
  };

  const decrement = () => {
    if (count > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCount((c) => Math.max(0, c - 1));
    }
  };

  const productiveBreeds = breeds.filter((b) => b.averageProduction > 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { resetForm(); onClose(); }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Eggs</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS !== "ios");
                if (selectedDate) setDate(selectedDate);
              }}
              display={Platform.OS === "ios" ? "inline" : "default"}
            />
          )}
          {showDatePicker && Platform.OS === "ios" && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}

          {/* Count — Mobile-native stepper */}
          <Text style={styles.label}>Egg Count</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={[styles.stepperButton, count === 0 && styles.stepperButtonDisabled]}
              onPress={decrement}
              disabled={count === 0}
              activeOpacity={0.6}
            >
              <Text style={[styles.stepperButtonText, count === 0 && styles.stepperButtonTextDisabled]}>-</Text>
            </TouchableOpacity>
            <View style={styles.stepperValue}>
              <Text style={styles.stepperCount}>{count}</Text>
              <Text style={styles.stepperUnit}>eggs</Text>
            </View>
            <TouchableOpacity style={styles.stepperButton} onPress={increment} activeOpacity={0.6}>
              <Text style={styles.stepperButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Breed Selector */}
          {productiveBreeds.length > 0 ? (
            <>
              <Text style={styles.label}>Breed (optional)</Text>
              <View style={styles.breedSelector}>
                <TouchableOpacity
                  style={[styles.breedChip, !breedId && styles.breedChipActive]}
                  onPress={() => { Haptics.selectionAsync(); setBreedId(undefined); }}
                >
                  <Text style={[styles.breedChipText, !breedId && styles.breedChipTextActive]}>All</Text>
                </TouchableOpacity>
                {productiveBreeds.map((breed) => (
                  <TouchableOpacity
                    key={breed.id}
                    style={[styles.breedChip, breedId === breed.id && styles.breedChipActive]}
                    onPress={() => { Haptics.selectionAsync(); setBreedId(breed.id); }}
                  >
                    <Text style={[styles.breedChipText, breedId === breed.id && styles.breedChipTextActive]}>
                      {breed.name || breed.breed}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          {/* Notes */}
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="Any notes..."
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor={colors.gray[400]}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, count <= 0 && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={count <= 0 || createLog.isLoading}
          >
            {createLog.isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Log {count} Egg{count !== 1 ? "s" : ""}</Text>
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
  form: { flex: 1 },
  formContent: { padding: 16, gap: 8 },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginTop: 8 },
  dateButton: { backgroundColor: colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.gray[200] },
  dateButtonText: { fontSize: 16, color: colors.gray[800] },
  doneButton: { alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 16 },
  doneButtonText: { fontSize: 16, color: colors.primary, fontWeight: "500" },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, paddingVertical: 16 },
  stepperButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  stepperButtonDisabled: { backgroundColor: colors.gray[200] },
  stepperButtonText: { fontSize: 28, fontWeight: "600", color: colors.white, marginTop: -2 },
  stepperButtonTextDisabled: { color: colors.gray[400] },
  stepperValue: { alignItems: "center", minWidth: 80 },
  stepperCount: { fontSize: 48, fontWeight: "700", color: colors.primary },
  stepperUnit: { fontSize: 14, color: colors.gray[500], marginTop: -4 },
  input: { backgroundColor: colors.white, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.gray[200], color: colors.gray[900] },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  breedSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  breedChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  breedChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  breedChipText: { fontSize: 14, color: colors.gray[700] },
  breedChipTextActive: { color: colors.white },
  footer: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  submitButton: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
});
