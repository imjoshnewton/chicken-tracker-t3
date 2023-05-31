import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "../../components/shared/Loader";
import AppLayout from "../../layouts/AppLayout";
import { useUserData } from "../../lib/hooks";

const AppHome = () => {
  const router = useRouter();
  const { defaultFlock, status } = useUserData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status == "authenticated") {
      if (defaultFlock) {
        router.push(`/app/flocks/${defaultFlock}`);
      } else {
        router.push(`/app/flocks/`);
      }
    } else if (status == "loading") {
      setLoading(true);
    } else {
      router.push("/api/auth/signin");
    }
  }, [status]);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader show={loading} />
      </main>
    </>
  );
};

AppHome.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default AppHome;
