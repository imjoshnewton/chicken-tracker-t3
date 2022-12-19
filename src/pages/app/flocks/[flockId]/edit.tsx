import Card from "../../../../components/shared/Card";
import { useFlockData, useUserData } from "../../../../lib/hooks";
import Loader from "../../../../components/shared/Loader";
import FlockForm from "../../../../components/flocks/FlockEditForm";
import AppLayout from "../../../../layouts/AppLayout";

const Edit = () => {
  const { user } = useUserData();
  const { flockId, flock } = useFlockData();

  return (
    <main>
      <Card title="Edit Flock">
        {flock && user ? (
          <FlockForm flock={flock} userId={user.id}></FlockForm>
        ) : (
          <Loader show={true} />
        )}
      </Card>
    </main>
  );
};

Edit.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Edit;
