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
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "../lib/trpc";
import { colors } from "../constants/Colors";

interface BreedFormModalProps {
  visible: boolean;
  onClose: () => void;
  flockId: string;
  breed?: {
    id: string;
    name: string | null;
    breed: string;
    description: string | null;
    count: number;
    averageProduction: number;
    imageUrl: string | null;
  };
}

export default function BreedFormModal({ visible, onClose, flockId, breed }: BreedFormModalProps) {
  const isEdit = !!breed;

  const [name, setName] = React.useState("");
  const [breedType, setBreedType] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [count, setCount] = React.useState("");
  const [avgProduction, setAvgProduction] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (breed) {
      setName(breed.name || "");
      setBreedType(breed.breed || "");
      setDescription(breed.description || "");
      setCount(String(breed.count));
      setAvgProduction(String(breed.averageProduction));
      setImageUrl(breed.imageUrl || undefined);
    } else {
      resetForm();
    }
  }, [breed, visible]);

  const utils = trpc.useContext();

  const createBreed = trpc.breeds.createBreed.useMutation({
    onSuccess: () => {
      utils.flocks.getFlock.invalidate({ flockId });
      resetForm();
      onClose();
    },
  });

  const updateBreed = trpc.breeds.updateBreed.useMutation({
    onSuccess: () => {
      utils.flocks.getFlock.invalidate({ flockId });
      resetForm();
      onClose();
    },
  });

  const deleteBreed = trpc.breeds.deleteBreed.useMutation({
    onSuccess: () => {
      utils.flocks.getFlock.invalidate({ flockId });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setName("");
    setBreedType("");
    setDescription("");
    setCount("");
    setAvgProduction("");
    setImageUrl(undefined);
  };

  const handleSubmit = () => {
    if (!breedType.trim()) return;
    const parsedCount = parseInt(count) || 0;
    const parsedAvg = parseFloat(avgProduction) || 0;

    if (isEdit && breed) {
      updateBreed.mutate({
        id: breed.id,
        name: name.trim() || null,
        breed: breedType.trim(),
        description: description.trim(),
        count: parsedCount,
        averageProduction: parsedAvg,
        imageUrl: imageUrl || "",
        flockId,
      });
    } else {
      createBreed.mutate({
        name: name.trim(),
        breed: breedType.trim(),
        description: description.trim(),
        count: parsedCount,
        averageProduction: parsedAvg,
        imageUrl: imageUrl || "",
        flockId,
      });
    }
  };

  const handleDelete = () => {
    if (!breed) return;
    Alert.alert("Delete Breed", `Are you sure you want to delete "${breed.name || breed.breed}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteBreed.mutate({ id: breed.id }),
      },
    ]);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const isSubmitting = createBreed.isLoading || updateBreed.isLoading;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? "Edit Breed" : "Add Breed"}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          {/* Image */}
          <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderEmoji}>🐓</Text>
                <Text style={styles.imagePlaceholderText}>Add photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Name (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Henrietta"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.gray[400]}
          />

          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rhode Island Red"
            value={breedType}
            onChangeText={setBreedType}
            placeholderTextColor={colors.gray[400]}
          />

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={2}
            placeholder="Notes about this breed..."
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={colors.gray[400]}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Count</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="0"
                value={count}
                onChangeText={setCount}
                placeholderTextColor={colors.gray[400]}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Avg Production/Day</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0"
                value={avgProduction}
                onChangeText={setAvgProduction}
                placeholderTextColor={colors.gray[400]}
              />
            </View>
          </View>

          {isEdit && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete Breed</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !breedType.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!breedType.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>{isEdit ? "Save Changes" : "Add Breed"}</Text>
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
  imageContainer: { alignSelf: "center", marginBottom: 8 },
  image: { width: 100, height: 100, borderRadius: 50 },
  imagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.gray[100], justifyContent: "center", alignItems: "center" },
  imagePlaceholderEmoji: { fontSize: 32 },
  imagePlaceholderText: { fontSize: 12, color: colors.gray[400], marginTop: 2 },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginTop: 8 },
  input: { backgroundColor: colors.white, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.gray[200], color: colors.gray[900] },
  textArea: { minHeight: 60, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  deleteButton: { marginTop: 24, padding: 16, alignItems: "center" },
  deleteButtonText: { fontSize: 16, color: "#dc2626", fontWeight: "500" },
  footer: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  submitButton: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
});
