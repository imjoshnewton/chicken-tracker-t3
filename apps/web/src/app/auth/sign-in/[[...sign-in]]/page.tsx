import { SignIn } from "@clerk/nextjs";

interface SignInPageProps {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeRedirectUrl(value?: string | string[]) {
  const redirectUrl = typeof value === "string" ? value : value?.[0];

  if (!redirectUrl) {
    return "/app/flocks";
  }

  try {
    const url = new URL(redirectUrl, "https://flocknerd.com");

    if (
      url.pathname.startsWith("/auth/sign-in") ||
      url.pathname.startsWith("/auth/sign-up")
    ) {
      return "/app/flocks";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    if (
      redirectUrl.startsWith("/auth/sign-in") ||
      redirectUrl.startsWith("/auth/sign-up")
    ) {
      return "/app/flocks";
    }

    return redirectUrl;
  }
}

export default async function Page({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectUrl = normalizeRedirectUrl(resolvedSearchParams.redirect_url);

  return (
    <main className="container mx-auto flex h-screen justify-center">
      <SignIn redirectUrl={redirectUrl} />
    </main>
  );
}
