import { currentUser } from "@clerk/nextjs";
import Loader from "@components/shared/Loader";
import { redirect } from "next/navigation";

export const metadata = {
  title: "FlockNerd - App Index",
  description: "Flock Stats for Nerds",
};

export const runtime = "edge";

const AppHome = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/sign-in");
  } else {
    redirect("/app/flocks");
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader show={true} />
      </main>
    </>
  );
};

export default AppHome;
