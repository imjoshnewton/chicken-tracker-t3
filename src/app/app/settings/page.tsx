import Card from "../../../components/shared/Card";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import NewUserForm from "./NewUserForm";

const Settings = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/api/auth/signin");

  return (
    <main className="h-full p-0 lg:h-auto lg:p-8 lg:px-[3.5vw]">
      <Card
        title="User Settings"
        className="pb-safe animate__animated animate__fadeIn h-full py-0 lg:h-auto lg:pt-4 lg:pb-4"
      >
        <NewUserForm user={session.user} />
      </Card>
    </main>
  );
};

export default Settings;
