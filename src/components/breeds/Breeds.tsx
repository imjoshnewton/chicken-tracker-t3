import { Breed } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MdAdd,
  MdOutlineEdit,
  MdOutlineExpandMore,
  MdStar,
} from "react-icons/md";
import BreedModal from "./BreedModal";
import Loader from "../shared/Loader";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function Breeds({
  flockId,
  breeds,
  className,
  top,
  userId,
}: {
  flockId: string | undefined;
  breeds: Breed[];
  className: string;
  top?: string | null;
  userId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const curParams = new URLSearchParams(searchParams ? searchParams : "");
  const path = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBreed, setSellectedBreed] = useState<Breed | null>(null);

  const totalBirds = breeds
    .map((b) => b.count)
    .reduce((acc, current) => acc + current, 0);

  useEffect(() => {
    // Define the function that checks window width
    const handleResize = () => {
      if (window?.innerWidth >= 1024) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    // Call the function initially to set state according to initial window size
    handleResize();

    // Set the event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!breeds) {
    return (
      <div className="flex h-full min-h-[75vh] items-center justify-center">
        <Loader show={true}></Loader>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2
        className="flex items-center justify-between hover:cursor-pointer dark:text-gray-300"
        onClick={() => setIsActive(!isActive)}
      >
        Birds
        <MdOutlineExpandMore
          className={
            "inline transition-all " + (isActive ? "rotate-180" : "rotate-0")
          }
        />
      </h2>
      <AnimatePresence>
        {isActive && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 flex flex-col gap-y-4 "
            >
              {breeds.length > 1 && (
                <span className="hidden sm:hidden md:hidden lg:block">
                  Total: {totalBirds}
                </span>
              )}
            </motion.div>
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap justify-between gap-y-4 overflow-y-hidden dark:text-gray-300 lg:gap-x-2"
            >
              {breeds.length < 1 && (
                <div className="basis-full text-center">
                  <p className="mb-3">
                    Your flock doesn&apos;t have any birds...
                  </p>
                  <p className="mb-4">Click here to add some 👇</p>
                </div>
              )}
              {breeds?.map((breed: Breed, index: number) => {
                return (
                  <motion.li
                    className={`group relative flex basis-[100%] items-center rounded-lg border pr-4 shadow transition-all hover:cursor-pointer hover:shadow-lg lg:basis-1/4 lg:pr-2 xl:basis-1/6 ${
                      curParams.get("breedFilter") == breed.id
                        ? "active bg-[#84A8A3]/95 text-white"
                        : null
                    }`}
                    key={breed.id}
                    onClick={() => {
                      if (curParams.get("breedFilter") == breed.id) {
                        curParams.delete("breedFilter");
                        router.replace(`${path}?${curParams.toString()}`);
                      } else {
                        curParams.set("breedFilter", breed.id);
                        router.replace(`${path}?${curParams.toString()}`);
                      }
                    }}
                  >
                    <div className="relative h-full basis-1/5">
                      <Image
                        src={breed.imageUrl!}
                        fill={true}
                        className="rounded-l-lg object-cover"
                        alt={breed.name ?? ""}
                      />
                    </div>
                    <div className="flex flex-col justify-center p-3 dark:text-gray-300 lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
                      {breed.name ? (
                        <strong>{breed.name}</strong>
                      ) : (
                        <strong>{breed.breed}</strong>
                      )}
                      {breed.count > 1 && (
                        <div className="block">
                          <strong className="inline lg:hidden">Count: </strong>
                          {breed.count}
                        </div>
                      )}
                    </div>
                    <button
                      className="ml-auto h-8 w-8 rounded-lg p-0 text-gray-700 opacity-100 transition-all hover:!bg-gray-900/40 hover:text-gray-700 hover:shadow group-hover:bg-gray-900/10 group-hover:opacity-100 group-[.active]:text-gray-300 group-[.active]:hover:border-white group-[.active]:hover:text-white md:absolute md:h-full md:w-1/5 md:rounded-l-lg md:rounded-r-none md:text-gray-300 md:hover:text-white lg:opacity-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSellectedBreed(breed);
                        setShowModal(true);
                      }}
                    >
                      <MdOutlineEdit />
                    </button>
                    <MdStar
                      className={`absolute -right-3 -top-3 text-2xl text-accent2 ${
                        breed.id == top ? "" : "hidden"
                      }`}
                    />
                  </motion.li>
                );
              })}
              <button
                className="btn min-h-10 w-full basis-full rounded px-4 py-2 shadow outline-none transition-all focus:outline-none lg:basis-1/4 xl:w-auto xl:basis-1/6"
                type="button"
                onClick={() => {
                  setShowModal(true);
                  setSellectedBreed(null);
                }}
              >
                <MdAdd className="text-2xl" />
                &nbsp;Add Birds
              </button>
            </motion.ul>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {showModal && (
          <BreedModal
            flockId={flockId}
            breed={selectedBreed}
            closeModal={() => {
              setShowModal(false);
              setSellectedBreed(null);
            }}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
