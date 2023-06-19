import { Breed } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import {
  MdAdd,
  MdOutlineEdit,
  MdOutlineExpandLess,
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
  user,
}: {
  flockId: string | undefined;
  breeds: Breed[];
  className: string;
  top?: string | null;
  user:
    | ({
        id: string;
      } & {
        name?: string | null | undefined;
        email?: string | null | undefined;
        image?: string | null | undefined;
      })
    | undefined;
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

  if (!breeds) {
    return (
      <div className="flex basis-[48%] items-center justify-center">
        <Loader show={true}></Loader>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2
        className="mb-6 flex items-center justify-between dark:text-gray-300"
        onClick={() => setIsActive(!isActive)}
      >
        Birds
        <span className="hidden sm:hidden md:hidden lg:block">
          {totalBirds}
        </span>
        {isActive ? (
          <MdOutlineExpandLess className="inline lg:hidden" />
        ) : (
          <MdOutlineExpandMore className="inline lg:hidden" />
        )}
      </h2>
      <motion.ul
        className={
          isActive
            ? "flex flex-wrap justify-between gap-y-4 dark:text-gray-300 lg:gap-x-2"
            : "hidden flex-wrap justify-between gap-y-4 dark:text-gray-300 lg:flex lg:gap-x-2"
        }
      >
        {breeds.length < 1 && (
          <div className="basis-full text-center">
            <p className="mb-3">Your flock doesn&apos;t have any birds...</p>
            <p className="mb-4">Click here to add some 👇</p>
          </div>
        )}
        {breeds?.map((breed: Breed, index: number) => {
          return (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                ease: "easeInOut",
                duration: 0.3,
                delay: index * 0.1,
              }}
              className={`group relative flex basis-[100%] items-center rounded-lg border pr-4 shadow transition-all hover:cursor-pointer hover:shadow-lg lg:basis-1/6 lg:pr-2 ${
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
              <div className="flex flex-col items-center justify-center p-3 dark:text-gray-300 lg:flex-1 lg:flex-row lg:justify-between lg:gap-2">
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
                className="ml-auto h-8 w-8 rounded-lg border-gray-400 p-0 text-gray-700 opacity-100 transition-all hover:border-2 hover:text-gray-700 hover:shadow group-hover:opacity-100 group-[.active]:text-gray-300 group-[.active]:hover:border-white group-[.active]:hover:text-white lg:hidden lg:text-gray-400 lg:opacity-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSellectedBreed(breed);
                  setShowModal(true);
                }}
              >
                <MdOutlineEdit />
              </button>
              <MdStar
                className={`absolute -top-3 -right-3 text-2xl text-accent2 ${
                  breed.id == top ? "" : "hidden"
                }`}
              />
            </motion.li>
          );
        })}
        <button
          className="mr-1 mt-4 mb-1 h-10 w-full basis-full rounded bg-white px-4 py-2 outline-none transition-all hover:shadow-lg focus:outline-none xl:w-auto"
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
      <AnimatePresence initial={false}>
        {showModal && (
          <BreedModal
            flockId={flockId}
            breed={selectedBreed}
            closeModal={() => {
              setShowModal(false);
              setSellectedBreed(null);
            }}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
