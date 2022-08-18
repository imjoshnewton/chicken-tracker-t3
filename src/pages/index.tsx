import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { useUserData } from "../libs/hooks";

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const Home: NextPage = () => {
  const router = useRouter();
  const { defaultFlock, status } = useUserData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status == "authenticated") {
      router.push(`/flocks/${defaultFlock}`);
    }
    else if (status == "loading") {
      setLoading(true);
    }
    else  {
      router.push('/api/auth/signin');
    }
  }, [status]);
  
  return (
    <main>
      { loading && (
        <div className="flex justify-center">
          <Loader show={true}></Loader>
        </div>
      )}
    </main>
  );
};

export default Home;

import { authOptions } from './api/auth/[...nextauth]'
import { unstable_getServerSession } from "next-auth/next"

export async function getServerSideProps(context: any) {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
    },
  }
}