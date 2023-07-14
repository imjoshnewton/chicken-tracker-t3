import Loader from "@components/shared/Loader";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata = {
  title: "FlockNerd - App Index",
  description: "Flock Stats for Nerds",
};

const AppHome = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
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
