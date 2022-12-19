import { useSession } from "next-auth/react";
import Card from "../../../components/Card";
import FlockForm from "../../../components/FlockEditForm";
import Loader from "../../../components/Loader";
import NewUserForm from "../../../components/NewUserForm";

export default function NewUser() {
  const { data } = useSession();

  if (!data?.user) {
    return (
      <main>
        <div className="shadow-xl">
          <Card title="New user">
            <div className="flex justify-center">
              <Loader show={true} />
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (!data.user.image && !data.user.name) {
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
              <NewUserForm user={data.user} />
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
              userId={data.user.id}
            />
          </div>
        </Card>
      </div>
    </main>
  );
}
