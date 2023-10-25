import { Line } from "react-chartjs-2";
import Link from "next/link";
import {
  MdOutlineTrendingDown,
  MdOutlineTrendingUp,
  MdArrowDownward,
  MdArrowUpward,
} from "react-icons/md";
import type { Breed, Flock } from "@prisma/client";
import {
  Chart as ChartJS,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { differenceInDays } from "date-fns";

ChartJS.register(
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

//
// Helper function to create array of dates for chart
//
function createChartArray(
  logs: { date: string; count: number }[],
  limit: number,
) {
  const dates = getDatesInRange(Number(limit));

  const logsArray = logs?.map((log) => {
    return {
      ...log,
      date: new Date(log.date).toLocaleString("us-EN", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
    };
  });

  const retArray = dates.map((date) => {
    const stringValue = date.toLocaleString("us-EN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const total = logsArray?.reduce((sum, log) => {
      if (log.date === stringValue) {
        return sum + log.count;
      }
      return sum;
    }, 0);

    return {
      date: stringValue,
      count: total,
    };
  });

  return retArray;
}

//
// Helper function to calculate the target daily average for a given flock
//
function calcDailyAverage(
  flock: Flock & { breeds: Breed[] },
  breedFilter?: string,
): number {
  const breedAverages = flock.breeds.length
    ? breedFilter
      ? flock.breeds
          .filter((breed) => breed.id == breedFilter)
          .map((breed) => (breed.averageProduction * breed.count) / 7)
      : flock.breeds.map((breed) => (breed.averageProduction * breed.count) / 7)
    : [0];
  const dailyAverage = breedAverages.reduce((a, b) => a + b, 0);

  return dailyAverage;
}

//
// Helper function to calculate the actual daily average for a given flock
//
function calcActualDailyAverage(logs: { date: string; count: number }[]) {
  const average = logs?.length
    ? logs.map((l) => l.count).reduce((a, b) => a + b) / logs.length
    : 0;

  return average;
}

//
// Helper function to create array of dates withint a range from today
//
function getDatesInRange(limit: number): Date[] {
  const retArray: Date[] = [];
  const today = new Date(Date.now());

  for (let i: number = limit - 1; i >= 0; i--) {
    const newDate = new Date(today);
    retArray.push(new Date(newDate.setDate(today.getDate() - i)));
  }

  return retArray;
}

//
// Component to display the daily averages
//
function DailyAverages({
  targetDailyAvg,
  actualDailyAvg,
  thisWeekAvg,
  lastWeekAvg,
}: {
  targetDailyAvg: number;
  actualDailyAvg: number;
  thisWeekAvg: number;
  lastWeekAvg: number;
}) {
  console.log("thisWeekAvg", thisWeekAvg);
  console.log(typeof thisWeekAvg);
  console.log("lastWeekAvg", lastWeekAvg);
  console.log(typeof lastWeekAvg);

  return (
    <>
      <div className="flex justify-around">
        <div className="flex flex-col items-center justify-center text-center dark:text-gray-300">
          Target Daily Avg
          <br />
          {targetDailyAvg.toFixed(2)}
        </div>
        <div className="flex flex-col items-center dark:text-gray-300">
          Actual Daily Avg
          <br />
          <div className="flex items-center">
            <span>{actualDailyAvg.toFixed(2)}</span>
            <span className="ml-1">
              {actualDailyAvg < targetDailyAvg ? (
                <MdArrowDownward className="text-red-600" />
              ) : actualDailyAvg > targetDailyAvg ? (
                <MdArrowUpward className=" text-green-600" />
              ) : null}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-around dark:text-gray-300">
        <div className="flex flex-col items-center justify-center text-center">
          Last Weeks Avg
          <br />
          {lastWeekAvg ? lastWeekAvg?.toFixed(2) : "n/a"}
        </div>
        <div className="flex flex-col items-center dark:text-gray-300">
          This Weeks Avg
          <br />
          <div className="flex items-center">
            <span className="ml-1">
              {thisWeekAvg ? thisWeekAvg.toFixed(2) : "n/a"}
            </span>
            <span className="ml-1">
              {thisWeekAvg < lastWeekAvg ? (
                <MdOutlineTrendingDown className="text-red-600" />
              ) : thisWeekAvg > lastWeekAvg ? (
                <MdOutlineTrendingUp className=" text-green-600" />
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

//
// Main component
//
export default function ProductionChart({
  stats,
  flock,
  className,
  range,
  onRangeChange,
  breedFilter,
}: {
  stats: any | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  range: { from: Date; to: Date };
  onRangeChange: any;
  breedFilter?: string;
}) {
  function chartData(logs: any[], flock: Flock & { breeds: Breed[] }) {
    const flockDailyAverage = calcDailyAverage(flock, breedFilter);
    const chartArray = createChartArray(
      logs,
      differenceInDays(range.to, range.from),
    );

    return {
      datasets: [
        {
          data: chartArray.map((i: any) => i.count),
          label: "Egg Production",
          backgroundColor: "rgba(39,166,154,0.2)",
          borderColor: "rgba(39,166,154,1)",
          pointBackgroundColor: "rgba(39,166,154,0.8)",
          pointBorderColor: "rgba(39,166,154,0.8)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          // borderWidth: 4,
          tension: 0.3,
          pointRadius: 5,
          hoverRadius: 7,
        },
        {
          data: chartArray.map(() => flockDailyAverage),
          label: "Target Average",
          backgroundColor: "rgba(149,159,177,0.2)",
          borderColor: "rgba(149,159,177,1)",
          pointBackgroundColor: "rgba(148,159,177,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          pointRadius: 0,
        },
      ],
      labels: chartArray.map((d) => d.date),
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Chart.js Line Chart",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        ticks: {
          // forces step size to be 50 units
          stepSize: 2,
        },
      },
    },
  };

  const targetDailyAvg = calcDailyAverage(flock, breedFilter);
  const actualDailyAvg = calcActualDailyAverage(stats.logs);

  console.log("stats", stats);

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className=" dark:text-gray-300">Production</h3>
        {/* <select defaultValue={limit} onChange={onRangeChange} className="mb-4">
          <option value="7">Last 7 Days</option>
          <option value="15">Last 15 Days</option>
          <option value="30">Last 30 Days</option>
        </select> */}
        <DatePickerWithRange />
      </div>
      <div className="flex flex-col">
        <div className="min-h-[300px] w-[99%] md:min-h-[275px]">
          <Line
            data={chartData(stats.logs, flock)}
            options={options}
            id="productionChart"
          ></Line>
        </div>
        <div className="p-2"></div>
        <Link
          href="/app/logs"
          className="text-stone-400 transition-colors hover:text-stone-700"
        >
          See all logs &gt;
        </Link>
        <div className="p-2"></div>
        <DailyAverages
          targetDailyAvg={targetDailyAvg}
          actualDailyAvg={actualDailyAvg}
          thisWeekAvg={
            typeof stats.thisWeekAvg?.avg == "number"
              ? stats.thisWeekAvg.avg
              : parseFloat(stats.thisWeekAvg?.avg)
          }
          lastWeekAvg={
            typeof stats.lastWeekAvg?.avg == "number"
              ? stats.lastWeekAvg.avg
              : parseFloat(stats.lastWeekAvg?.avg)
          }
        />
      </div>
    </div>
  );
}
