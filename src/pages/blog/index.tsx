import { useRouter } from "next/router";
import Loader from "../../components/shared/Loader";
import SiteLayout from "../../layouts/SiteLayout";

const AppHome = () => {
  const router = useRouter();

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader show={true} />
      </main>
    </>
  );
};

AppHome.getLayout = function getLayout(page: React.ReactElement) {
  return <SiteLayout>{page}</SiteLayout>;
};

export default AppHome;
