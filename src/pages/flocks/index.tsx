import Card from "../../components/Card";
import Image from "next/image";
import { useAllFlocks } from "../../libs/hooks";
import Link from "next/link";
import FlockForm from "../../components/FlockEditForm";
import { useState } from "react";
import { MdAdd } from "react-icons/md";

// TO-DO: Add list of all flocks
export default function Flocks() {
  const { flocks, userId, loading } = useAllFlocks();
  const [addFlock, setAddFlock] = useState(false);

  if ((!flocks?.length && userId && !loading) || (userId && addFlock)) {
    return (
      <main>
        <div className='shadow'>
          <Card title='New FLock'>
            <FlockForm
              flock={{
                id: "",
                name: "",
                description: "",
                imageUrl: "",
                type: "",
                zip: "",
                userId: "",
                breeds: [],
              }}
              userId={userId}
            />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className='flex items-center justify-end'>
        <button
          className='px-4 py-2 btn rounded hover:shadow-lg bg-white outline-none focus:outline-none mr-1 w-full xl:w-auto h-10 basis-full md:basis-1/3 lg:basis-1/5 mt-4 mb-1 transition-all'
          type='button'
          onClick={() => {
            setAddFlock(true);
          }}>
          <MdAdd className='text-2xl' /> &nbsp;Add New Flock
        </button>
      </div>
      <ul className='flex items-center justify-between flex-wrap'>
        {flocks?.map((flock) => {
          return (
            <li className='basis-full sm:basis-1/2 lg:basis-1/3' key={flock.id}>
              <Link href={`/flocks/${flock.id}`}>
                <a>
                  <div className='shadow hover:shadow-2xl'>
                    <Card title={"Flock"}>
                      <div className='flex items-center flex-wrap sm:flex-nowrap'>
                        <Image
                          src={flock?.imageUrl}
                          width='150'
                          height='150'
                          className='flock-image'
                          alt=''
                        />
                        {/* <pre>{limit}</pre> */}
                        <div className='ml-0 md:ml-6'>
                          <div className='flex items-center'>
                            <h1 className='mr-3 dark:text-gray-300'>
                              {flock?.name}
                            </h1>
                          </div>
                          <p className='description dark:text-gray-300'>
                            {flock?.description}
                          </p>
                          <p className='text-gray-400 mt-2 dark:text-gray-400'>
                            {flock?.type}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </a>
              </Link>
            </li>
          );
        })}
        <li className='basis-3/4'></li>
      </ul>
    </main>
  );
}
