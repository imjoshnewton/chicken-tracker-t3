import { Breed } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Breeds.module.scss";

export default function Breeds({ breeds, className }: { breeds: Breed[], className: string}) {
    const [isActive, setIsActive] = useState(true);

    if (!breeds) {
        return null;
    }

    return (
        <div className={className}>
            <h3 className={styles.title} onClick={() => setIsActive(!isActive)}>Breeds</h3>
            {/* {isActive && ( */}
                <div className={isActive ? styles.active : styles.content}>
                    {
                        breeds?.map((breed: Breed, index: number) => {
                            return (
                                <div className="flex items-center breed mb-4" key={index}>
                                    <Image src={breed.imageUrl!} width="50" height="50" className="flock-image" alt="" />
                                    <div className="ms-3">
                                        <p>
                                            <strong>{breed.name}</strong>
                                            <br />
                                            <strong>Count: </strong>{breed.count}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            {/* )} */}
        </div>
    );
}