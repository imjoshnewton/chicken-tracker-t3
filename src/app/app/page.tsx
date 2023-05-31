import Loader from "@components/shared/Loader";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";

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
