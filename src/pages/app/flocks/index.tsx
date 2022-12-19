import Card from "../../../components/shared/Card";
import Image from "next/image";
import { useAllFlocks } from "../../../lib/hooks";
import Link from "next/link";
import FlockForm from "../../../components/flocks/FlockEditForm";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import AppLayout from "../../../layouts/AppLayout";

// TO-DO: Add list of all flocks
const Flocks = () => {
  const { flocks, userId, loading } = useAllFlocks();
  const [addFlock, setAddFlock] = useState(false);

  if ((!flocks?.length && userId && !loading) || (userId && addFlock)) {
    return (
      <main>
        <div className="shadow">
          <Card title="New FLock">
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
              userId={userId}
            />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="flex items-center justify-end">
        <button
          className="btn mr-1 mt-4 mb-1 h-10 w-full basis-full rounded bg-white px-4 py-2 outline-none transition-all hover:shadow-lg focus:outline-none md:basis-1/3 lg:basis-1/5 xl:w-auto"
          type="button"
          onClick={() => {
            setAddFlock(true);
          }}
        >
          <MdAdd className="text-2xl" /> &nbsp;Add New Flock
        </button>
      </div>
      <ul className="flex flex-wrap items-center justify-between">
        {flocks?.map((flock) => {
          return (
            <li className="basis-full sm:basis-1/2 lg:basis-1/3" key={flock.id}>
              <Link href={`/app/flocks/${flock.id}`}>
                <div className="shadow hover:shadow-2xl">
                  <Card title={"Flock"}>
                    <div className="flex flex-wrap items-center sm:flex-nowrap">
                      <Image
                        src={flock?.imageUrl}
                        width="150"
                        height="150"
                        className="flock-image"
                        alt=""
                      />
                      {/* <pre>{limit}</pre> */}
                      <div className="ml-0 md:ml-6">
                        <div className="flex items-center">
                          <h1 className="mr-3 dark:text-gray-300">
                            {flock?.name}
                          </h1>
                        </div>
                        <p className="description dark:text-gray-300">
                          {flock?.description}
                        </p>
                        <p className="mt-2 text-gray-400 dark:text-gray-400">
                          {flock?.type}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Link>
            </li>
          );
        })}
        <li className="basis-3/4"></li>
      </ul>
    </main>
  );
};

Flocks.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Flocks;
