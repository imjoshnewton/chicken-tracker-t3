import { type NextPage } from "next";
import { useRouter } from "next/router";
import Card from "../../../components/Card";
import AppLayout from "../../../layouts/AppLayout";

const Summary = () => {
  const router = useRouter();
  const { month, year } = router.query;

  return (
    <>
      <main>
        <Card title="Summary">
          <div>
            <p>{month}</p>
            <p>{year}</p>
          </div>
        </Card>
      </main>
    </>
  );
};

Summary.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Summary;
