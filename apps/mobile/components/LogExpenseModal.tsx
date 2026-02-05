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

const EXPENSE_CATEGORIES = [
  { value: "feed", label: "Feed" },
  { value: "suplements", label: "Supplements" },
  { value: "medication", label: "Medication" },
  { value: "other", label: "Other" },
];

interface LogExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  flockId: string;
}

export default function LogExpenseModal({ visible, onClose, flockId }: LogExpenseModalProps) {
  const [date, setDate] = React.useState(new Date());
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState("feed");
  const [memo, setMemo] = React.useState("");
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const utils = trpc.useContext();
  const createExpense = trpc.expenses.createExpense.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.expenses.getExpenses.invalidate();
      utils.stats.getExpenseStats.invalidate();
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setDate(new Date());
    setAmount("");
    setCategory("feed");
    setMemo("");
    setShowDatePicker(false);
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    createExpense.mutate({
      flockId,
      date: startOfDay(date),
      amount: numAmount,
      category,
      memo: memo || undefined,
    });
  };

  const isValid = amount && parseFloat(amount) > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Expense</Text>
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

          {/* Amount */}
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categorySelector}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.categoryChip, category === cat.value && styles.categoryChipActive]}
                onPress={() => { Haptics.selectionAsync(); setCategory(cat.value); }}
              >
                <Text style={[styles.categoryChipText, category === cat.value && styles.categoryChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Memo */}
          <Text style={styles.label}>Memo (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="What was this expense for?"
            value={memo}
            onChangeText={setMemo}
            placeholderTextColor={colors.gray[400]}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || createExpense.isLoading}
          >
            {createExpense.isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Log Expense</Text>
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
  cancelText: { fontSize: 16, color: colors.tertiary },
  headerTitle: { fontSize: 18, fontWeight: "600", color: colors.gray[900] },
  form: { flex: 1 },
  formContent: { padding: 16, gap: 8 },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginTop: 8 },
  dateButton: { backgroundColor: colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.gray[200] },
  dateButtonText: { fontSize: 16, color: colors.gray[800] },
  doneButton: { alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 16 },
  doneButtonText: { fontSize: 16, color: colors.tertiary, fontWeight: "500" },
  amountContainer: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[200], paddingHorizontal: 16 },
  currencySymbol: { fontSize: 20, fontWeight: "600", color: colors.gray[500], marginRight: 4 },
  amountInput: { flex: 1, padding: 16, fontSize: 20, fontWeight: "600", color: colors.gray[900] },
  categorySelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  categoryChipActive: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  categoryChipText: { fontSize: 14, color: colors.gray[700] },
  categoryChipTextActive: { color: colors.white },
  input: { backgroundColor: colors.white, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.gray[200], color: colors.gray[900] },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  footer: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  submitButton: { backgroundColor: colors.tertiary, borderRadius: 12, padding: 16, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
});
