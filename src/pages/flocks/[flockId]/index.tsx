import Image from "next/image";

import { useFlockData } from "../../../lib/hooks";

import Card from "../../../components/Card";
import Loader from "../../../components/Loader";
import Breeds from "../../../components/Breeds";
import Stats from "../../../components/Stats";
import LogModal from "../../../components/LogModal";
import ExpenseModal from "../../../components/ExpenseModal";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdOutlineEdit } from "react-icons/md";

export default function Flocks() {
  const router = useRouter();
  const { flockId, flock, stats, range } = useFlockData();

  console.log("Logs: ", stats.logs);

  const onRangeChange = (event: any) => {
    const newRange = event.target.value;

    router.replace({
      query: { ...router.query, statsRange: newRange },
    });
  };

  return (
    <main>
      {flock ? (
        <div className="shadow-xl">
          <Card title="Flock Details" key={flockId?.toString()}>
            <Link
              href={`/flocks/${flockId}/edit`}
              className="absolute top-0 right-0 mt-3 mr-5 flex items-center p-3 text-stone-400 transition-colors hover:cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
            >
              Edit&nbsp;&nbsp;
              <MdOutlineEdit />
            </Link>
            <div className="flex flex-wrap items-center">
              <Image
                src={flock?.imageUrl}
                width="150"
                height="150"
                className="flock-image"
                alt="A user uploaded image that represents this flock"
              />
              {/* <pre>{limit}</pre> */}
              <div className="ml-0 md:ml-6">
                <div className="flex items-center">
                  <h1 className="mr-3 dark:text-gray-300">{flock?.name}</h1>
                </div>
                <p className="description dark:text-gray-300">
                  {flock?.description}
                </p>
                <p className="mt-2 text-gray-400 dark:text-gray-400">
                  {flock?.type}
                </p>
              </div>
              <div className="ml-0 mt-4 flex w-full flex-wrap self-start lg:ml-auto lg:mt-0 lg:w-auto">
                <LogModal flockId={flockId?.toString()} />
                <div className="p-1"></div>
                <ExpenseModal flockId={flockId?.toString()} />
              </div>
            </div>
            <div className="divider my-6 dark:border-t-gray-500"></div>
            <div className="justify-evently flex flex-wrap">
              <Breeds
                flockId={flockId?.toString()}
                breeds={flock?.breeds}
                className="basis-full xl:basis-[23%]"
              ></Breeds>
              <div className="basis-[2%] p-3"></div>
              <Stats
                stats={stats}
                flock={flock}
                className="basis-full xl:basis-[75%]"
                limit={range.toString()}
                onRangeChange={onRangeChange}
              ></Stats>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center">
          <Loader show={true}></Loader>
        </div>
      )}
    </main>
  );
}
