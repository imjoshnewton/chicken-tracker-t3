import { SignIn } from "@clerk/nextjs";

export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirectUrl =
    typeof searchParams.redirect_url == "string"
      ? searchParams.redirect_url
      : searchParams.redirect_url?.at(0);

  return (
    <main className="container mx-auto flex h-screen justify-center">
      <SignIn redirectUrl={redirectUrl} />
    </main>
  );
}
