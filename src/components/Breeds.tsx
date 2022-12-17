import { Breed } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import {
  MdAdd,
  MdOutlineExpandLess,
  MdOutlineExpandMore,
} from "react-icons/md";
import BreedModal from "./BreedModal";
import Loader from "./Loader";

export default function Breeds({
  flockId,
  breeds,
  className,
}: {
  flockId: string | undefined;
  breeds: Breed[];
  className: string;
}) {
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBreed, setSellectedBreed] = useState<Breed | null>(null);

  const totalBirds = breeds
    .map((b) => b.count)
    .reduce((acc, current) => acc + current);

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
            <p className="mb-3">
              A flock isn&apos;t much of a flock without any chickens...
            </p>
            <p className="mb-4">
              Click the button below to add your first breed. 👇
            </p>
          </div>
        )}
        {breeds?.map((breed: Breed, index: number) => {
          return (
            <li
              className="mb-4 flex basis-[100%] items-center rounded-lg border shadow transition-shadow hover:cursor-pointer hover:shadow-lg"
              key={index}
              onClick={() => {
                setSellectedBreed(breed);
                setShowModal(true);
              }}
            >
              <div className="relative h-full basis-1/5">
                <Image
                  src={breed.imageUrl!}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-l-lg"
                  alt={breed.name ?? ""}
                />
              </div>
              <div className="p-3 dark:text-gray-300">
                <p>
                  <strong>{`${breed.name ? breed.name : ""}${
                    breed.name ? " - " : ""
                  }${breed.breed}`}</strong>
                  <br />
                  <strong>Count: </strong>
                  {breed.count}
                </p>
              </div>
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
