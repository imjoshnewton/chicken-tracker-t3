import Card from "../../../components/Card";
import { useFlockData, useUserData } from "../../../lib/hooks";
import Loader from "../../../components/Loader";
import FlockForm from "../../../components/FlockEditForm";

export default function Edit() {
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
}
