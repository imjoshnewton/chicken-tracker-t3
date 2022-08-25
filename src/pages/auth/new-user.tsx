import Card from "../../components/Card";
import FlockForm from "../../components/FlockEditForm";

export default function NewUser() {
  const { data } = useSession();

  if (!data?.user) {
    return (
      <main>
        <div className='shadow-xl'>
          <Card title='New user'>
            <div className='flex justify-center'>
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
        <div className='shadow-xl'>
          <Card title='New user info'>
            <div className='flex'>
              <NewUserForm user={data.user} />
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className='shadow-xl'>
        <Card title='New flock'>
          <div className='flex flex-col'>
            <section>
              <h2 className='mb-3'>Welcome!</h2>
              <p className='mb-3'>
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

import { authOptions } from "../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import { useSession } from "next-auth/react";
import Loader from "../../components/Loader";
import NewUserForm from "../../components/NewUserForm";

export async function getServerSideProps(context: any) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}