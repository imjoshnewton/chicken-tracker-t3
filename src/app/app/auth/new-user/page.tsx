import Card from "../../../../components/shared/Card";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import NewUserForm from "../../settings/NewUserForm";
import FlockForm from "../../flocks/FlockEditForm";

export const metadata = {
  title: "FlockNerd - New User Setup",
  description: "Flock Stats for Nerds",
};

export default async function NewUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (!session.user.image && !session.user.name) {
    return (
      <main className="flex flex-col justify-center p-0 lg:p-8 lg:px-[3.5vw]">
        <div className="shadow-xl">
          <Card title="New user info">
            <div className="flex flex-col">
              <section>
                <h2 className="mb-3">Welcome!</h2>
                <p className="mb-3">
                  Let&apos;s get to know you a little better...
                  <br />
                  Complete your profile by uploading a profile picture and
                  letting us know your name.
                </p>
              </section>
              <NewUserForm user={session.user} />
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col justify-center p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card
          title="New flock"
          className="pb-safe h-full !pl-0 !pr-0 lg:h-auto lg:pt-4 lg:pb-0"
          titleStyle="pl-8 !mb-0"
        >
          <div className="flex flex-col">
            <section className="p-8 pb-4">
              <h2 className="mb-3">Welcome!</h2>
              <p className="mb-3">
                Let&apos;s make a new flock&nbsp;🐓🦆🦃
                <br />
                Give your flock a name, description (optional), and select
                whether they are egg layers or meat birds.
              </p>
            </section>

            <FlockForm
              flock={{
                id: "",
                name: "",
                description: "",
                imageUrl: "",
                type: "",
                zip: "",
                userId: "",
                breeds: [],
              }}
              userId={session.user.id}
            />
          </div>
        </Card>
      </div>
    </main>
  );
}
