"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { Session } from "next-auth";

import Breeds from "@components/breeds/Breeds";
import ExpenseModal from "@components/flocks/ExpenseModal";
import LogModal from "@components/flocks/LogModal";
import Stats from "@components/flocks/Stats";
import Card from "@components/shared/Card";
import Loader from "@components/shared/Loader";

import { useFlockDataAppDir } from "@lib/hooks";
import { usePathname, useSearchParams } from "next/navigation";
import EditModal from "@components/flocks/EditModal";
import TaskList from "@components/tasks/Tasks";
import AddTaskModal from "@components/tasks/AddTaskModal";

const Flock = ({ session, flockId }: { session: Session; flockId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();
  const { flock, stats, range, breedStats } = useFlockDataAppDir(
    session,
    flockId,
    searchParams?.get("statsRange") || "7",
    searchParams?.get("breedFilter")
  );

  const onRangeChange = useCallback(
    (event: any) => {
      const curParams = new URLSearchParams(searchParams || "");

      curParams.set("statsRange", event.target.value.toString());

      router.replace(`${path}?${curParams.toString()}`);
    },
    [router, searchParams, path]
  );

  const clearFilter = useCallback(() => {
    const curParams = new URLSearchParams(searchParams || "");
    curParams.delete("breedFilter");

    router.replace(`${path}?${curParams.toString()}`);
  }, [router, searchParams, path]);

  const filterBreed = flock?.breeds.find(
    (breed) => breed.id == (searchParams?.get("breedFilter") as string)
  );

  if (!flock) {
    return <LoaderLayout />;
  }

  return (
    <FlockLayout
      flock={flock}
      flockId={flockId}
      onRangeChange={onRangeChange}
      range={range}
      clearFilter={clearFilter}
      filterText={filterBreed?.name || filterBreed?.breed}
      filterId={searchParams?.get("breedFilter") as string}
      stats={stats}
      breedStats={breedStats}
      session={session}
    />
  );
};

const LoaderLayout = () => (
  <main className="flex h-full min-h-[75vh] flex-col justify-center p-0 lg:p-8 lg:px-[3.5vw]">
    <div className="flex h-full items-center justify-center">
      <Loader show={true} />
    </div>
  </main>
);

const FlockLayout = ({
  flock,
  flockId,
  onRangeChange,
  range,
  clearFilter,
  filterText,
  filterId,
  stats,
  breedStats,
  session,
}: any) => (
  <main className="flex flex-col justify-center p-0 lg:p-8 lg:px-[3.5vw]">
    <div className="shadow-xl">
      <Card title="Flock Details" className="" key={flockId?.toString()}>
        {/* <EditLink flockId={flockId} /> */}
        <FlockActions flockId={flockId?.toString()} session={session} />
        <FlockInfo flock={flock} flockId={flockId} />
        <TaskList
          tasks={flock?.tasks}
          flockId={flockId}
          userId={session.user.id!}
        />
        <Stats
          stats={stats}
          flock={flock}
          className="mt-4 basis-full xl:basis-[75%]"
          limit={range.toString()}
          onRangeChange={onRangeChange}
          filter={filterText}
          filterId={filterId}
          clearFilter={clearFilter}
        />
        <Breeds
          flockId={flockId?.toString()}
          breeds={flock?.breeds}
          top={breedStats?.at(0)?.breedId}
          className="mt-4 basis-full xl:basis-[23%]"
          user={session?.user}
        />
      </Card>
    </div>
  </main>
);

const FlockActions = ({
  flockId,
  session,
}: {
  flockId: string;
  session: Session;
}) => (
  <div className="absolute top-0 right-0 mt-3 mr-5 flex self-start md:mt-2">
    <AddTaskModal session={session} flockId={flockId} />
    <EditModal session={session} flockId={flockId} />
  </div>
);

const FlockInfo = ({ flock, flockId }: any) => (
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
    <FlockDetails flock={flock} />
    <Actions flockId={flockId} />
  </motion.div>
);

const FlockDetails = ({ flock }: any) => (
  <div className="ml-0 md:ml-6">
    <div className="flex items-center">
      <h1 className="mr-3 dark:text-gray-300">{flock?.name}</h1>
    </div>
    <p className="description dark:text-gray-300">{flock?.description}</p>
    <p className="mt-2 text-gray-400 dark:text-gray-400">{flock?.type}</p>
  </div>
);

const Actions = ({ flockId }: any) => (
  <div className="ml-0 mt-4 flex w-full flex-wrap self-start lg:ml-auto lg:mt-0 lg:w-auto">
    <LogModal flockId={flockId?.toString()} />
    <div className="p-1"></div>
    <ExpenseModal flockId={flockId?.toString()} />
  </div>
);

export default Flock;
