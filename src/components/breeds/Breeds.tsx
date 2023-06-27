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
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  className="flex flex-wrap justify-between gap-y-4 dark:text-gray-300 lg:gap-x-2"
>
  <AnimatePresence>
    {isActive && (
      <>
        {breeds.length < 1 && (
          <div className="basis-full text-center">
            <p className="mb-3">Your flock doesn&apos;t have any birds...</p>
            <p className="mb-4">Click here to add some 👇</p>
          </div>
        )}
        {breeds?.map((breed: Breed, index: number) => {
          //...existing code
        })}
        <button
          //...existing code
        </button>
      </>
    )}
  </AnimatePresence>
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
