import Loader from "@components/shared/Loader";
import { redirect } from "next/navigation";

export const metadata = {
  title: "FlockNerd - App Index",
  description: "Flock Stats for Nerds",
};

export const runtime = "nodejs";

const AppHome = async () => {
  redirect("/app/flocks");

  // return (
  //   <>
  //     <main className="flex min-h-screen flex-col items-center justify-center">
  //       <Loader show={true} />
  //     </main>
  //   </>
  // );
};

export default AppHome;
