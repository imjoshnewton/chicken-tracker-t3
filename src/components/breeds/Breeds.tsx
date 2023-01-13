import { Breed } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import {
  MdAdd,
  MdOutlineEdit,
  MdOutlineExpandLess,
  MdOutlineExpandMore,
} from "react-icons/md";
import BreedModal from "./BreedModal";
import Loader from "../shared/Loader";
import { useRouter } from "next/router";

export default function Breeds({
  flockId,
  breeds,
  className,
}: {
  flockId: string | undefined;
  breeds: Breed[];
  className: string;
}) {
  const router = useRouter();
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
      <ul
        className={
          isActive
            ? "flex flex-wrap justify-between dark:text-gray-300"
            : "hidden flex-wrap justify-between dark:text-gray-300 lg:flex"
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
            <li
              className={`group mb-4 flex basis-[100%] items-center rounded-lg border pr-4 shadow transition-all hover:cursor-pointer hover:shadow-lg ${
                router.query.breedFilter == breed.id
                  ? "active bg-secondary/95 text-white"
                  : null
              }`}
              key={breed.id}
              onClick={() => {
                if (router.query["breedFilter"] == breed.id) {
                  delete router.query["breedFilter"];

                  router.replace({
                    query: { ...router.query },
                  });
                } else {
                  router.replace({
                    query: { ...router.query, breedFilter: breed.id },
                  });
                }

                // setSellectedBreed(breed);
                // setShowModal(true);
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
              <div className="flex flex-col justify-center p-3 dark:text-gray-300">
                {/* <p> */}
                <span>{breed.name}</span>
                <strong>{breed.breed}</strong>
                {/* <br /> */}
                <div>
                  <strong>Count: </strong>
                  {breed.count}
                </div>
                {/* </p> */}
              </div>
              <button
                className="ml-auto h-8 w-8 rounded-lg border-gray-400 p-0 text-gray-700 opacity-100 transition-all hover:border-2 hover:text-gray-700 hover:shadow group-hover:opacity-100 group-[.active]:text-gray-300 group-[.active]:hover:border-white group-[.active]:hover:text-white lg:text-gray-400 lg:opacity-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSellectedBreed(breed);
                  setShowModal(true);
                }}
              >
                <MdOutlineEdit />
              </button>
            </li>
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
      </ul>
      {showModal ? (
        <BreedModal
          flockId={flockId}
          breed={selectedBreed}
          show={true}
          closeModal={() => {
            setShowModal(false);
            setSellectedBreed(null);
          }}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
