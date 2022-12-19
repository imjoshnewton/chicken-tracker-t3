import Image from "next/image";
import { useRouter } from "next/router";
import Card from "../../../../../components/shared/Card";
import Loader from "../../../../../components/shared/Loader";
import AppLayout from "../../../../../layouts/AppLayout";
import { trpc } from "../../../../../utils/trpc";
import { type NextPageWithLayout } from "../../../../_app";

const Summary: NextPageWithLayout = () => {
  const router = useRouter();
  const { flockId, month, year } = router.query;

  const summary = trpc.stats.getFlockSummary.useQuery({
    flockId: typeof flockId == "string" ? flockId : "",
    month: typeof month == "string" ? month : "",
    year: typeof year == "string" ? year : "",
  });

  return (
    <>
      <main>
        <section className="max-w-xl">
          <Card title="Monthly Summary">
            {/* <div>
              <p>{flockId}</p>
              <p>{month}</p>
              <p>{year}</p>
            </div> */}
            {summary.isLoading ? (
              <Loader show={true} />
            ) : summary.isError ? (
              <p>Error!</p>
            ) : summary.data ? (
              <>
                <div className="flex flex-wrap items-center">
                  <Image
                    src={summary.data.flock.image}
                    width="150"
                    height="150"
                    className="flock-image"
                    alt="A user uploaded image that represents this flock"
                  />
                  {/* <pre>{limit}</pre> */}
                  <div className="ml-0 md:ml-6">
                    <div className="flex items-center">
                      <h1 className="mr-3 dark:text-gray-300">
                        {summary.data.flock.name}
                      </h1>
                    </div>
                    <p className="description dark:text-gray-300">
                      Summary for {summary.data.month}&nbsp;{summary.data.year}
                    </p>
                    {/* <p className="mt-2 text-gray-400 dark:text-gray-400">
                    {flock?.type}
                  </p> */}
                  </div>
                  {/* <div className="ml-0 mt-4 flex w-full flex-wrap self-start lg:ml-auto lg:mt-0 lg:w-auto">
                  <LogModal flockId={flockId?.toString()} />
                  <div className="p-1"></div>
                  <ExpenseModal flockId={flockId?.toString()} />
                </div> */}
                </div>
                <div className="divider my-6 dark:border-t-gray-500"></div>
                <div className="justify-evently flex flex-col">
                  <h2 className="mb-4">Egg Production</h2>
                  <div className="flex justify-between">
                    <strong>🥚 Total: </strong>
                    <span>{summary.data.logs.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>📝 # of Entries: </strong>
                    <span>{summary.data.logs.numLogs}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>📆 Daily Average: </strong>
                    <span>{summary.data.logs.calcAvg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>💪 Largest Haul: </strong>
                    <span>{summary.data.logs.largest}</span>
                  </div>
                </div>
                <div className="justify-evently flex flex-col">
                  <h2 className="mb-4 mt-6 flex justify-between">Expenses:</h2>
                  <div className="flex justify-between">
                    <strong>💰 Total: </strong>
                    <span>{summary.data.expenses.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : null}
          </Card>
        </section>
      </main>
    </>
  );
};

Summary.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Summary;
