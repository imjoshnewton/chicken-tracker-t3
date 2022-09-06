import { useSession } from "next-auth/react";
import Card from "../../components/Card";
import Loader from "../../components/Loader";
import NewUserForm from "../../components/NewUserForm";

export default function Settings() {
  const { data, status } = useSession();

  if (!data?.user) {
    return (
      <Card title='User Settings'>
        <Loader show={true} />
      </Card>
    );
  }

  return (
    <Card title='User Settings'>
      <NewUserForm user={data.user} />
    </Card>
  );
}
