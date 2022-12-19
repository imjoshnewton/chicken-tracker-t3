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
    <main>
      <Card title="User Settings">
        <NewUserForm user={data.user} />
      </Card>
    </main>
  );
};

Settings.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Settings;
