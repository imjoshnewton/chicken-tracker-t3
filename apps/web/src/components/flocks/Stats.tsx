import ProductionChart from "./ProductionChart";
import ExpenseChart from "./ExpenseChart";
import { MdClose, MdFilterAlt } from "react-icons/md";
import { Breed, Flock } from "@lib/db/schema-postgres";

export default function Stats({
  stats,
  flock,
  className,
  range,
  onRangeChange,
  onMonthsChange,
  filter,
  filterId,
  clearFilter,
  expenseMonths,
}: {
  stats: {
    expenses?: any;
    logs?: any;
    lastWeekAvg?: any;
    thisWeekAvg?: any;
  };
  flock: Flock & { breeds: Breed[] };
  className: string;
  range: { from: Date; to: Date };
  onRangeChange: (event: any) => void;
  onMonthsChange: (value: string) => void;
  filter?: string;
  filterId?: string;
  clearFilter?: () => void;
  expenseMonths?: number;
}) {
  return (
    <div className={className}>
      <div className="mb-4 flex justify-between">
        <h2 className="dark:text-gray-300">Stats</h2>
        {filter && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <MdFilterAlt className="text-lg" />
            </div>
            <button
              className="flex items-center gap-1 rounded-full bg-gray-200 py-1.5 pl-2 pr-3 text-xs cursor-pointer transition-all hover:bg-gray-300"
              onClick={() => clearFilter && clearFilter()}
            >
              <MdClose />
              <span>{filter}</span>
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap lg:justify-between">
        <ProductionChart
          stats={stats}
          flock={flock}
          className={"flex-48"}
          range={range}
          onRangeChange={onRangeChange}
          breedFilter={filterId}
        />
        <div className="p-2"></div>
        <ExpenseChart
          stats={stats}
          className={"flex-48"}
          numMonths={expenseMonths}
          onMonthsChange={onMonthsChange}
        />
      </div>
    </div>
  );
}