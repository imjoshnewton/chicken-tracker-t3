import { SignIn } from "@clerk/nextjs";



// Simplest possible approach for Next.js 15 compatibility
export default async function Page(props: any) {
  const searchParams = await (props ? props.searchParams : {});
  const params = props ? await props.params : {};
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
