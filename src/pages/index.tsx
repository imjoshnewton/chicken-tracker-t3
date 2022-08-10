import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { useUserData } from "../libs/hooks";
import { trpc } from "../utils/trpc";

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

const TechnologyCard = ({
  name,
  description,
  documentation,
}: TechnologyCardProps) => {
  return (
    <section className="flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
      <h2 className="text-lg text-gray-700">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <a
        className="mt-3 text-sm underline text-violet-500 decoration-dotted underline-offset-2"
        href={documentation}
        target="_blank"
        rel="noreferrer"
      >
        Documentation
      </a>
    </section>
  );
};

export default Home;
