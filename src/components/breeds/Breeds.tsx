"use client";

import { Breed } from "@lib/db/schema-postgres";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdAdd, MdOutlineEdit, MdStar } from "react-icons/md";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "src/components/ui/accordion";
import Loader from "../shared/Loader";
import BreedModal from "./BreedModal";

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
  const [defaultOpen, setDefaultOpen] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);

  const totalBirds = breeds
    .map((b) => b.count)
    .reduce((acc, current) => acc + current, 0);

  useEffect(() => {
    // Set accordion to be open by default on larger screens
    const handleResize = () => {
      if (window?.innerWidth >= 1024) {
        setDefaultOpen(["breeds-section"]);
      } else {
        setDefaultOpen([]);
      }
    };

    // Call the function initially
    handleResize();

    // Set the event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!breeds) {
    return (
      <div className="flex h-full min-h-[75vh] items-center justify-center">
        <Loader show={true} />
      </div>
    );
  }

  const accordionContent = (
    <>
      <div className="mb-6 flex flex-col gap-y-4">
        {breeds.length > 1 && (
          <span className="hidden sm:hidden md:hidden lg:block">
            Total: {totalBirds}
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-between gap-y-4 overflow-y-hidden dark:text-gray-300 lg:gap-x-2">
        {breeds.length < 1 && (
          <div className="basis-full text-center">
            <p className="mb-3">
              Your flock doesn&apos;t have any birds...
            </p>
            <p className="mb-4">Click here to add some 👇</p>
          </div>
        )}
        {breeds?.map((breed: Breed) => {
          const cssClass = `group relative flex basis-[100%] items-center rounded-lg border pr-4 shadow transition-all hover:cursor-pointer hover:shadow-lg lg:basis-1/4 lg:pr-2 xl:basis-1/6 ${
            curParams.get("breedFilter") == breed.id
              ? "active bg-[#84A8A3]/95 text-white"
              : ""
          }`;
          
          const handleClick = () => {
            if (curParams.get("breedFilter") == breed.id) {
              curParams.delete("breedFilter");
              router.replace(`${path}?${curParams.toString()}`);
            } else {
              curParams.set("breedFilter", breed.id);
              router.replace(`${path}?${curParams.toString()}`);
            }
          };
          
          return (
            <li className={cssClass} key={breed.id} onClick={handleClick}>
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
                  setSelectedBreed(breed);
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
            </li>
          );
        })}
        <button
          className="btn min-h-10 w-full basis-full rounded px-4 py-2 shadow outline-none transition-all focus:outline-none lg:basis-1/4 xl:w-auto xl:basis-1/6"
          type="button"
          onClick={() => {
            setShowModal(true);
            setSelectedBreed(null);
          }}
        >
          <MdAdd className="text-2xl" />
          &nbsp;Add Birds
        </button>
      </div>
    </>
  );

  return (
    <div className={className}>
      <Accordion
        type="single"
        collapsible={true}
        defaultValue={defaultOpen[0]}
        className="border-none"
      >
        <AccordionItem value="breeds-section" className="border-none">
          <AccordionTrigger className="px-0 py-2 text-base font-semibold hover:no-underline dark:text-gray-300">
            Birds
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            {accordionContent}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <AnimatePresence initial={false}>
        {showModal && (
          <BreedModal
            flockId={flockId}
            breed={selectedBreed}
            closeModal={() => {
              setShowModal(false);
              setSelectedBreed(null);
            }}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}