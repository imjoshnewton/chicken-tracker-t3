type ClerkErrorLike = {
  errors?: Array<{
    longMessage?: string;
    message?: string;
    code?: string;
  }>;
};

export function getClerkErrorMessage(error: unknown) {
  const fallback = "Something went wrong. Please try again.";

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const clerkError = error as ClerkErrorLike;
  const firstError = clerkError.errors?.[0];

  if (firstError?.longMessage) {
    return firstError.longMessage;
  }

  if (firstError?.message) {
    return firstError.message;
  }

  return fallback;
}

