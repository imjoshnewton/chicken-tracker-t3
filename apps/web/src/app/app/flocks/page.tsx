import { currentUsr } from "@lib/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "../../../components/shared/Card";
import AddFlockButton from "./AddFlockButton";
import { Suspense } from "react";
import Loader from "@components/shared/Loader";
import * as flocksService from "../../../services/flocks.service";

export const metadata = {
  title: "FlockNerd - All Flocks",
  description: "Flock Stats for Nerds",
};

export const runtime = "nodejs";

const Flocks = async () => {
  const user = await currentUsr();
  const flocks = await flocksService.getUserFlocks(user.id);
  const [singleFlock] = flocks;

  if (flocks.length === 1 && singleFlock) {
    redirect(`/app/flocks/${singleFlock.id}`);
  }

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <AddFlockButton />
      </div>
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <Loader show={true} />
          </div>
        }
      >
        <FlockList flocks={flocks} />
      </Suspense>
    </main>
  );
};

async function FlockList({
  flocks,
}: {
  flocks: Awaited<ReturnType<typeof flocksService.getUserFlocks>>;
}) {

  return (
    <ul className="grid grid-cols-1 grid-rows-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {flocks?.map((flock, index) => {
        return (
          <li
            className="animate__animated animate__fadeIn"
            style={{ animationDelay: `${index * 0.15}s` }}
            key={flock.id}
          >
            <Link href={`/app/flocks/${flock.id}`} className="h-full md:flex">
              <div className="h-full w-full shadow transition-all hover:shadow-2xl md:flex">
                <Card title={"Flock"}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                    <Image
                      src={flock.imageUrl}
                      width="150"
                      height="150"
                      className="flock-image aspect-square object-cover"
                      alt="Image that represents the user's flock"
                    />
                    <div>
                      <div className="flex items-center">
                        <h1 className="mr-3 dark:text-gray-300">
                          {flock.name}
                        </h1>
                      </div>
                      <p className="description dark:text-gray-300">
                        {flock?.description}
                      </p>
                      <p className="mt-2 text-gray-400 dark:text-gray-400">
                        {flock.type}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Link>
          </li>
        );
      })}
      {/* I'm not sure why this is necesary  */}
      <li className="basis-3/4"></li>
    </ul>
  );
}

export default Flocks;
