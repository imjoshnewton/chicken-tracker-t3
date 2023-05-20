import Card from "../../../../components/shared/Card";
import { useFlockData, useUserData } from "../../../../lib/hooks";
import Loader from "../../../../components/shared/Loader";
import FlockForm from "../../../../components/flocks/FlockEditForm";
import AppLayout from "../../../../layouts/AppLayout";

const Edit = () => {
  const { user } = useUserData();
  const { flockId, flock } = useFlockData();

  return (
    <main className="h-full p-0 lg:h-auto lg:p-8 lg:px-[3.5vw]">
      <Card
        title="Edit Flock"
        className="pb-safe h-full py-0 lg:h-auto lg:pt-4 lg:pb-4"
      >
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
