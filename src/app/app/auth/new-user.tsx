import Card from "../../../components/shared/Card";
import FlockForm from "../../../components/flocks/FlockEditForm";
import Loader from "../../../components/shared/Loader";
import NewUserForm from "../../../components/NewUserForm";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";

export default async function NewUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (!session.user.image && !session.user.name) {
    return (
      <main>
        <div className="shadow-xl">
          <Card title="New user info">
            <div className="flex">
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
    <main>
      <div className="shadow-xl">
        <Card title="New flock">
          <div className="flex flex-col">
            <section>
              <h2 className="mb-3">Welcome!</h2>
              <p className="mb-3">
                Let&apos;s make a new flock.
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
