const DEFAULT_APP_REDIRECT = "/app";
const DEFAULT_SIGN_UP_REDIRECT = "/app/onboarding";

function firstValue(value?: string | string[]) {
  return typeof value === "string" ? value : value?.[0];
}

export function normalizeAuthRedirectUrl(
  value?: string | string[],
  fallback = DEFAULT_APP_REDIRECT,
) {
  const redirectUrl = firstValue(value);

  if (!redirectUrl) {
    return fallback;
  }

  try {
    const url = new URL(redirectUrl, "https://flocknerd.com");

    if (
      url.pathname.startsWith("/auth/sign-in") ||
      url.pathname.startsWith("/auth/sign-up")
    ) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    if (
      redirectUrl.startsWith("/auth/sign-in") ||
      redirectUrl.startsWith("/auth/sign-up")
    ) {
      return fallback;
    }

    if (!redirectUrl.startsWith("/")) {
      return fallback;
    }

    return redirectUrl;
  }
}

export function getDefaultSignInRedirect(value?: string | string[]) {
  return normalizeAuthRedirectUrl(value, DEFAULT_APP_REDIRECT);
}

export function getDefaultSignUpRedirect() {
  return DEFAULT_SIGN_UP_REDIRECT;
}

