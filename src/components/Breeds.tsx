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

  if (!breeds) {
    return (
      <div className='flex justify-center items-center basis-[48%]'>
        <Loader show={true}></Loader>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2
        className='flex justify-between items-center mb-6 dark:text-gray-300'
        onClick={() => setIsActive(!isActive)}>
        Breeds
        {isActive ? (
          <MdOutlineExpandLess className='inline md:hidden' />
        ) : (
          <MdOutlineExpandMore className='inline md:hidden' />
        )}
      </h2>
      <ul
        className={
          isActive
            ? "flex flex-wrap dark:text-gray-300"
            : "hidden md:flex flex-wrap dark:text-gray-300"
        }>
        {breeds?.map((breed: Breed, index: number) => {
          return (
            <li
              className='flex items-center breed mb-4'
              key={index}
              onClick={() => {
                setSellectedBreed(breed);
                setShowModal(true);
              }}>
              <Image
                src={breed.imageUrl!}
                width='50'
                height='50'
                className='flock-image'
                alt=''
              />
              <div className='ml-3 dark:text-gray-300'>
                <p>
                  <strong>{breed.name}</strong>
                  <br />
                  <strong>Count: </strong>
                  {breed.count}
                </p>
              </div>
            </li>
          );
        })}
        <button
          className='px-4 py-2 rounded hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 btn w-full md:w-auto h-10 bg-white basis-1/2'
          type='button'
          onClick={() => {
            setShowModal(true);
            setSellectedBreed(null);
          }}>
          <MdAdd className='text-2xl' />
          &nbsp;Add New Breed
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
