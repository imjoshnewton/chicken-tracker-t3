import { useSession } from "next-auth/react";
import Card from "../../../components/shared/Card";
import Loader from "../../../components/shared/Loader";
import NewUserForm from "../../../components/NewUserForm";
import AppLayout from "../../../layouts/AppLayout";

const Settings = () => {
  const { data, status } = useSession();

  if (!data?.user) {
    return (
      <Card title="User Settings">
        <Loader show={true} />
      </Card>
    );
  }

  return (
    <main className="h-full p-0 lg:h-auto lg:p-8 lg:px-[3.5vw]">
      <Card
        title="User Settings"
        className="pb-safe h-full py-0 lg:h-auto lg:pt-4 lg:pb-4"
      >
        <NewUserForm user={data.user} />
      </Card>
    </main>
  );
};

Settings.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Settings;
