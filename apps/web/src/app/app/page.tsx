import { currentUsr } from "@lib/auth";
import * as flocksService from "../../services/flocks.service";
import { redirect } from "next/navigation";

export const metadata = {
  title: "FlockNerd - App Index",
  description: "Flock Stats for Nerds",
};

export const runtime = "nodejs";

const AppHome = async () => {
  const user = await currentUsr();

  redirect(await flocksService.getUserFlockLandingPath(user.id));

  // return (
  //   <>
  //     <main className="flex min-h-screen flex-col items-center justify-center">
  //       <Loader show={true} />
  //     </main>
  //   </>
  // );
};

export default AppHome;
