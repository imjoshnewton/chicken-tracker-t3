import { Breed, Flock } from "@prisma/client";
import Loader from "../shared/Loader";
import ProductionChart from "./ProductionChart";
import ExpenseChart from "./ExpenseChart";
import { MdClose, MdFilterAlt } from "react-icons/md";

export default function Stats({
  stats,
  flock,
  className,
  limit,
  onRangeChange,
  filter,
  filterId,
  clearFilter,
}: {
  stats: any | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  limit: string;
  onRangeChange: any;
  filter?: string;
  filterId?: string;
  clearFilter?: () => void;
}) {
  if (!flock || !stats.logs) {
    return (
      <div className="flex basis-[48%] items-center justify-center">
        <Loader show={true}></Loader>
      </div>
    );
  }

  console.log("Filter: ", filter);

  return (
    <div className={className}>
      <div className="mb-4 flex justify-between">
        <h2 className="dark:text-gray-300">Stats</h2>
        {filter && (
          <div className="flex items-center gap-2">
            <MdFilterAlt className="text-lg" />
            <button
              className="flex items-center gap-1 rounded-full bg-gray-200 py-1.5 pl-2 pr-3 text-xs"
              onClick={() => (clearFilter ? clearFilter() : null)}
            >
              <MdClose />
              {filter}
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap">
        <ProductionChart
          stats={stats}
          flock={flock}
          className={"flex-48"}
          limit={limit}
          onRangeChange={onRangeChange}
          breedFilter={filterId}
        />
        <div className="p-2"></div>
        <ExpenseChart stats={stats} className={"flex-48"} />
      </div>
    </div>
  );
}
