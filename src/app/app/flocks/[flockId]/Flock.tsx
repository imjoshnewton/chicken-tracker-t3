"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { MdOutlineEdit } from "react-icons/md";

import Breeds from "@components/breeds/Breeds";
import ExpenseModal from "@components/flocks/ExpenseModal";
import LogModal from "@components/flocks/LogModal";
import Stats from "@components/flocks/Stats";
import Card from "@components/shared/Card";
import Loader from "@components/shared/Loader";
import { useFlockDataAppDir } from "@lib/hooks";
import { Session } from "next-auth";

const Flock = ({ session, flockId }: { session: Session; flockId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();
  const breedFilter = searchParams?.get("breedFilter");
  const statsRange = searchParams?.get("statsRange") || "7";
  const { flock, stats, range, breedStats } = useFlockDataAppDir(
    session,
    flockId,
    statsRange,
    breedFilter == null ? undefined : breedFilter
  );

  const onRangeChange = useCallback(
    (event: any) => {
      const newRange = event.target.value;
      const curParams = new URLSearchParams(searchParams ? searchParams : "");

      curParams.set("statsRange", newRange.toString());

      router.replace(`${path}?${curParams.toString()}`);
    },
    [router]
  );

  const clearFilter = useCallback(() => {
    const curParams = new URLSearchParams(searchParams ? searchParams : "");
    curParams.delete("breedFilter");

    router.replace(`${path}?${curParams.toString()}`);
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
          <Breeds
            flockId={flockId?.toString()}
            breeds={flock?.breeds}
            top={breedStats?.at(0)?.breedId}
            className="mt-4 basis-full xl:basis-[23%]"
            user={session?.user}
          ></Breeds>
        </Card>
      </div>
    </main>
  );
};

export default Flock;
