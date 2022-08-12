import { Breed } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Breeds.module.scss";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";

export default function Breeds({
  breeds,
  className,
}: {
  breeds: Breed[];
  className: string;
}) {
  const [isActive, setIsActive] = useState(false);

  if (!breeds) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className={styles.title} onClick={() => setIsActive(!isActive)}>
        Breeds
        {isActive ? (
          <MdOutlineExpandLess className='inline md:hidden' />
        ) : (
          <MdOutlineExpandMore className='inline md:hidden' />
        )}
      </h2>
      {/* {isActive && ( */}
      <div className={isActive ? "flex flex-wrap" : "hidden md:flex flex-wrap"}>
        {breeds?.map((breed: Breed, index: number) => {
          return (
            <div className='flex items-center breed mb-4' key={index}>
              <Image
                src={breed.imageUrl!}
                width='50'
                height='50'
                className='flock-image'
                alt=''
              />
              <div className='ml-3'>
                <p>
                  <strong>{breed.name}</strong>
                  <br />
                  <strong>Count: </strong>
                  {breed.count}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {/* )} */}
    </div>
  );
}
