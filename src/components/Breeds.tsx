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
        Chickens
        {isActive ? (
          <MdOutlineExpandLess className='inline md:hidden' />
        ) : (
          <MdOutlineExpandMore className='inline md:hidden' />
        )}
      </h2>
      <ul
        className={
          isActive
            ? "flex flex-wrap justify-between dark:text-gray-300"
            : "hidden md:flex justify-between flex-wrap dark:text-gray-300"
        }>
        {breeds.length < 1 && (
          <div className='text-center basis-full'>
            <p className='mb-3'>
              A flock isn&apos;t much of a flock without any chickens...
            </p>
            <p className='mb-4'>
              Click the button below to add your first breed. 👇
            </p>
          </div>
        )}
        {breeds?.map((breed: Breed, index: number) => {
          return (
            <li
              className='flex items-center mb-4 rounded-lg shadow basis-[100%] xl:basis-[49%] hover:cursor-pointer hover:shadow-lg border transition-shadow'
              key={index}
              onClick={() => {
                setSellectedBreed(breed);
                setShowModal(true);
              }}>
              <div className='h-full basis-1/5 relative'>
                <Image
                  src={breed.imageUrl!}
                  // width='60'
                  // height='60'
                  layout='fill'
                  objectFit='cover'
                  className='rounded-l-lg'
                  alt=''
                />
              </div>
              <div className='p-3 dark:text-gray-300'>
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
          className='px-4 py-2 rounded hover:shadow-lg bg-white outline-none focus:outline-none mr-1 w-full xl:w-auto h-10 basis-full mt-4 mb-1 transition-all'
          type='button'
          onClick={() => {
            setShowModal(true);
            setSellectedBreed(null);
          }}>
          <MdAdd className='text-2xl' />
          &nbsp;Add Chickens
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
