import Card from "../../components/Card";
import Image from "next/image";
import { useAllFlocks } from "../../libs/hooks";
import Link from "next/link";
import FlockForm from "../../components/FlockEditForm";

// TO-DO: Add list of all flocks
export default function Flocks() {
  const { flocks, userId } = useAllFlocks();

  console.log("Flocks: ", flocks);
  console.log("UserId: ", userId);

  if (!flocks?.length && userId) {
    return (
      <main>
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
      </main>
    );
  }

  return (
    <main>
      <ul className='flex items-center justify-between'>
        {flocks?.map((flock) => {
          return (
            <li className='basis-1/3' key={flock.id}>
              <Link href={`/flocks/${flock.id}`}>
                <a>
                  <div className='shadow hover:shadow-2xl'>
                    <Card title={"Flock"}>
                      <div className='flex items-center'>
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
      </ul>
    </main>
  );
}
