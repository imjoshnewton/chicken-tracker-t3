import { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdOutlineEdit } from "react-icons/md";
import { motion } from "framer-motion";

import { useFlockData } from "@lib/hooks";
import Card from "@components/shared/Card";
import Loader from "@components/shared/Loader";
import Breeds from "@components/breeds/Breeds";
import Stats from "@components/flocks/Stats";
import LogModal from "@components/flocks/LogModal";
import ExpenseModal from "@components/flocks/ExpenseModal";
import AppLayout from "@layouts/AppLayout";

const Flock = () => {
  const router = useRouter();
  const { breedFilter } = router.query;
  const { flockId, flock, stats, range, breedStats } = useFlockData();

  const onRangeChange = useCallback(
    (event: any) => {
      const newRange = event.target.value;

      router.replace({
        query: { ...router.query, statsRange: newRange },
      });
    },
    [router]
  );

  const clearFilter = useCallback(() => {
    const newQuery = { ...router.query };
    delete newQuery["breedFilter"];

    router.replace({
      query: newQuery,
    });
  }, [router]);

  const filterBreed = flock?.breeds.find(
    (breed) => breed.id == (breedFilter as string)
  );
  const filterText = filterBreed?.name || filterBreed?.breed || undefined;

  if (!flock) {
    return (
      <main className="flex h-full flex-col justify-center p-0 lg:p-8 lg:px-[3.5vw]">
        <div className="flex h-full items-center justify-center">
          <Loader show={true}></Loader>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col justify-center p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card
          title="Flock Details"
          className="pb-safe py-0 lg:pt-5 lg:pb-4"
          key={flockId?.toString()}
        >
          <Link
            href={`/app/flocks/${flockId}/edit`}
            className="absolute top-0 right-0 mt-3 mr-5 flex items-center p-3 text-stone-400 transition-colors hover:cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 md:mt-2"
          >
            Edit&nbsp;&nbsp;
            <MdOutlineEdit />
          </Link>
          <motion.div
            initial={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center"
          >
            <Image
              src={flock?.imageUrl}
              width="150"
              height="150"
              className="flock-image aspect-square object-cover"
              alt="A user uploaded image that represents this flock"
            />
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
          </motion.div>
          <div className="divider my-6 dark:border-t-gray-500"></div>
          <div className="justify-evently flex flex-wrap">
            <Breeds
              flockId={flockId?.toString()}
              breeds={flock?.breeds}
              top={breedStats?.at(0)?.breedId}
              className="basis-full xl:basis-[23%]"
            ></Breeds>
            <div className="basis-[2%] p-3"></div>
            <Stats
              stats={stats}
              flock={flock}
              className="basis-full xl:basis-[75%]"
              limit={range.toString()}
              onRangeChange={onRangeChange}
              filter={filterText}
              filterId={breedFilter as string}
              clearFilter={clearFilter}
            ></Stats>
          </div>
        </Card>
      </div>
    </main>
  );
};

Flock.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Flock;
