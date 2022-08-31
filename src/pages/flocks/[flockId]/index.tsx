import Image from "next/image";

import { useFlockData } from "../../../libs/hooks";

import Card from "../../../components/Card";
import Loader from "../../../components/Loader";
import Breeds from "../../../components/Breeds";
import Stats from "../../../components/Stats";
import LogModal from "../../../components/LogModal";
import ExpenseModal from "../../../components/ExpenseModal";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdOutlineEdit } from "react-icons/md";

export default function Flocks() {
  const router = useRouter();
  const { flockId, flock, stats, range } = useFlockData();

  console.log("Logs: ", stats.logs);

  const onRangeChange = (event: any) => {
    const newRange = event.target.value;

    router.replace({
      query: { ...router.query, statsRange: newRange },
    });
  };

  return (
    <main>
      {flock ? (
        <div className='shadow-xl'>
          <Card title='Flock Details' key={flockId?.toString()}>
            <Link href={`/flocks/${flockId}/edit`}>
              <a className='flex hover:cursor-pointer items-center absolute top-0 right-0 p-3 mt-3 mr-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors'>
                Edit&nbsp;&nbsp;
                <MdOutlineEdit />
              </a>
            </Link>
            <div className='flex items-center flex-wrap'>
              <Image
                src={flock?.imageUrl}
                width='150'
                height='150'
                className='flock-image'
                alt='A user uploaded image that represents this flock'
              />
              {/* <pre>{limit}</pre> */}
              <div className='ml-0 md:ml-6'>
                <div className='flex items-center'>
                  <h1 className='mr-3 dark:text-gray-300'>{flock?.name}</h1>
                </div>
                <p className='description dark:text-gray-300'>
                  {flock?.description}
                </p>
                <p className='text-gray-400 mt-2 dark:text-gray-400'>
                  {flock?.type}
                </p>
              </div>
              <div className='w-full ml-0 mt-4 lg:ml-auto md:mt-0 sm:w-auto flex self-start flex-wrap'>
                <LogModal flockId={flockId?.toString()} />
                <div className='p-1'></div>
                <ExpenseModal flockId={flockId?.toString()} />
              </div>
            </div>
            <div className='divider my-6 dark:border-t-gray-500'></div>
            <div className='flex flex-wrap justify-evently'>
              <Breeds
                flockId={flockId?.toString()}
                breeds={flock?.breeds}
                className='flex-48'></Breeds>
              <div className='p-3'></div>
              <Stats
                stats={stats}
                flock={flock}
                className='flex-48'
                limit={range.toString()}
                onRangeChange={onRangeChange}></Stats>
            </div>
          </Card>
        </div>
      ) : (
        <div className='flex justify-center'>
          <Loader show={true}></Loader>
        </div>
      )}
    </main>
  );
}

import { authOptions } from "../../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";

export async function getServerSideProps(context: any) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
