import Image from "next/image";
import Card from "../../components/Card";
import Loader from "../../components/Loader";
import Breeds from "../../components/Breeds";
import Stats from "../../components/Stats";
import { useFlockData } from "../../libs/hooks";
import Modal from "../../components/Modal";
import { useState } from "react";

export default function Flocks() {
  const [limit, setLimit] = useState("7");
  const { flockId, flock, loading } = useFlockData({ limit: limit });

  const onRangeChange = (event: any) => {
    setLimit(event.target.value);
    console.log("Limit: ", limit);
  };

  return (
    <main>
      {flock ? (
        <Card title='Flock Details' key={flockId?.toString()}>
          <div className='flex items-center flex-wrap'>
            <Image
              src={flock?.imageUrl}
              width='150'
              height='150'
              className='flock-image'
              alt=''
            />
            {/* <pre>{limit}</pre> */}
            <div className='ml-6'>
              <h1>{flock?.name}</h1>
              <p className='description'>{flock?.description}</p>
              <p className='text-gray-400 mt-2'>{flock?.type}</p>
            </div>
            <div className='ml-auto flex self-start'>
              <Modal flockId={flockId?.toString()} />
            </div>
          </div>
          <div className='divider my-6'></div>
          <div className='flex flex-wrap justify-evently'>
            <Breeds breeds={flock?.breeds} className='flex-50'></Breeds>
            <Stats
              logs={flock.logs}
              flock={flock}
              className='flex-50'
              onRangeChange={onRangeChange}></Stats>
          </div>
        </Card>
      ) : (
        <div className='flex justify-center'>
          <Loader show={true}></Loader>
        </div>
      )}
    </main>
  );
}
