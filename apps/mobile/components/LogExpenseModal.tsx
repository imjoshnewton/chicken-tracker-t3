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
import { showErrorToast } from "../lib/toast";

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
      utils.expenses.getExpenses.invalidate();
      utils.stats.getExpenseStats.invalidate();
    },
    onError: () => showErrorToast("Failed to log expense"),
  });

  const resetForm = () => {
    setDate(new Date());
    setAmount("");
    setCategory("feed");
    setMemo("");
    setShowDatePicker(false);
  };

  React.useEffect(() => {
    if (!visible) resetForm();
  }, [visible]);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) { showErrorToast("Enter a valid amount"); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createExpense.mutate({
      flockId,
      date: startOfDay(date),
      amount: numAmount,
      category,
      memo: memo || undefined,
    });
    onClose();
  };

  const isValid = amount && parseFloat(amount) > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Cancel" accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Expense</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!isValid || createExpense.isLoading} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Log expense" accessibilityRole="button" accessibilityState={{ disabled: !isValid || createExpense.isLoading }}>
            <Text style={[styles.headerAction, (!isValid || createExpense.isLoading) && { opacity: 0.4 }]}>Log</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)} accessibilityLabel="Select date" accessibilityRole="button">
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
              accessibilityLabel="Expense amount"
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
                accessibilityRole="button"
                accessibilityState={{ selected: category === cat.value }}
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
            accessibilityLabel="Memo"
          />
        </ScrollView>

      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  cancelText: { fontSize: 16, color: colors.tertiary },
  headerTitle: { fontSize: 18, fontWeight: "600", color: colors.gray[900] },
  headerAction: { fontSize: 16, fontWeight: "600", color: colors.tertiary },
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
  categoryChip: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  categoryChipActive: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  categoryChipText: { fontSize: 14, color: colors.gray[700] },
  categoryChipTextActive: { color: colors.white },
  input: { backgroundColor: colors.white, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.gray[200], color: colors.gray[900] },
  textArea: { minHeight: 80, textAlignVertical: "top" },
});
