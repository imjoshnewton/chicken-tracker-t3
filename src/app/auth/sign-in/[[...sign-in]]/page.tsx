import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="container mx-auto flex h-screen justify-center">
      <SignIn />
    </main>
  );
}
