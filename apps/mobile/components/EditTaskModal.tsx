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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { trpc } from "../lib/trpc";
import { colors } from "../constants/Colors";
import { showErrorToast } from "../lib/toast";

const RECURRENCE_OPTIONS = [
  { value: "", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  task: any;
}

export default function EditTaskModal({ visible, onClose, task }: EditTaskModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState(new Date());
  const [recurrence, setRecurrence] = React.useState("");
  const utils = trpc.useContext();

  React.useEffect(() => {
    if (task) {
      setTitle(task.title ?? "");
      setDescription(task.description ?? "");
      setDueDate(task.dueDate ? new Date(task.dueDate) : new Date());
      setRecurrence(task.recurrence ?? "");
    }
  }, [task]);

  const updateTask = trpc.tasks.updateTask.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.flocks.getFlock.invalidate();
      onClose();
    },
    onError: () => showErrorToast("Failed to update task"),
  });

  const deleteTask = trpc.tasks.deleteTask.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.flocks.getFlock.invalidate();
      onClose();
    },
    onError: () => showErrorToast("Failed to delete task"),
  });

  const handleSave = () => {
    if (!title.trim()) { showErrorToast("Enter a task title"); return; }
    updateTask.mutate({
      id: task.id,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      recurrence,
      status: task.completed ? "Complete" : "Incomplete",
      completed: task.completed ?? false,
    });
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteTask.mutate({ id: task.id });
        },
      },
    ]);
  };

  const isSaving = updateTask.isLoading || deleteTask.isLoading;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Cancel" accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving || !title.trim()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Save task" accessibilityRole="button" accessibilityState={{ disabled: isSaving || !title.trim() }}>
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.saveText, !title.trim() && { opacity: 0.4 }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor={colors.gray[400]}
            accessibilityLabel="Task title"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            placeholderTextColor={colors.gray[400]}
            multiline
            numberOfLines={3}
            accessibilityLabel="Task description"
          />

          <Text style={styles.label}>Due Date</Text>
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(_, date) => date && setDueDate(date)}
            style={styles.datePicker}
          />

          <Text style={styles.label}>Recurrence</Text>
          <View style={styles.chips}>
            {RECURRENCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, recurrence === opt.value && styles.chipActive]}
                onPress={() => setRecurrence(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: recurrence === opt.value }}
              >
                <Text style={[styles.chipText, recurrence === opt.value && styles.chipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} accessibilityLabel="Delete task" accessibilityRole="button">
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  headerTitle: { fontSize: 17, fontWeight: "600", color: colors.gray[900] },
  cancelText: { fontSize: 16, color: colors.gray[500] },
  saveText: { fontSize: 16, fontWeight: "600", color: colors.primary },
  body: { flex: 1, backgroundColor: colors.background },
  bodyContent: { padding: 16 },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, padding: 14, fontSize: 16, color: colors.gray[900] },
  textArea: { height: 80, textAlignVertical: "top" },
  datePicker: { alignSelf: "flex-start" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray[100] },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, color: colors.gray[600] },
  chipTextActive: { color: colors.white, fontWeight: "500" },
  deleteButton: { marginTop: 32, padding: 16, borderRadius: 12, backgroundColor: "#fef2f2", alignItems: "center" },
  deleteButtonText: { fontSize: 16, fontWeight: "500", color: "#dc2626" },
});
