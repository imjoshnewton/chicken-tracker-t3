import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Breeds.module.scss";

export default function Breeds({ breeds, className }) {
    const [isActive, setIsActive] = useState(false);

    if (!breeds) {
        return null;
    }

    return (
        <div className={className}>
            <h3 className={styles.title} onClick={() => setIsActive(!isActive)}>Breeds<span>{isActive ? '-' : '+'}</span></h3>
            {/* {isActive && ( */}
                <div className={isActive ? styles.active : styles.content}>
                    {
                        breeds?.map((breed, index) => {
                            return (
                                <div className="d-flex align-items-center breed" key={index}>
                                    <Image src={breed.imageUrl} width="50" height="50" className="flock-image" alt="" />
                                    <div className="ms-3">
                                        <p>
                                            <strong>{breed.breed}</strong>
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