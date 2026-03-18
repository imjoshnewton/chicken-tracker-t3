import { toast } from "burnt";
import * as Haptics from "expo-haptics";

export function showErrorToast(message: string) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  toast({
    title: message,
    preset: "error",
    haptic: "error",
  });
}

export function showSuccessToast(message: string) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  toast({
    title: message,
    preset: "done",
    haptic: "success",
  });
}
