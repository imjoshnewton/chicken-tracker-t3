import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { useUserData } from "../libs/hooks";

const Home: NextPage = () => {
  const router = useRouter();
  const { defaultFlock, status } = useUserData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status == "authenticated") {
      router.push(`/flocks/${defaultFlock}`);
    } else if (status == "loading") {
      setLoading(true);
    } else {
      router.push("/api/auth/signin");
    }
  }, [status]);

  return (
    <main>
      {loading && (
        <div className='flex justify-center'>
          <Loader show={true}></Loader>
        </div>
      )}
    </main>
  );
};

export default Home;
