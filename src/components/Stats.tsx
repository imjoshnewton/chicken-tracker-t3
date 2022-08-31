import { Breed, Flock } from "@prisma/client";
import { Line, Chart } from "react-chartjs-2";
import Link from "next/link";
import Loader from "./Loader";
import { subMonths } from "date-fns";
import {
  MdOutlineTrendingDown,
  MdOutlineTrendingUp,
  MdArrowDownward,
  MdArrowUpward,
} from "react-icons/md";
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
  BarElement,
} from "chart.js";

ChartJS.register(
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

export default function Stats({
  stats,
  flock,
  className,
  limit,
  onRangeChange,
}: {
  stats: any | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  limit: string;
  onRangeChange: any;
}) {
  if (!flock || !stats.logs) {
    return (
      <div className='flex justify-center items-center basis-[48%]'>
        <Loader show={true}></Loader>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className='flex justify-between'>
        <h2 className='mb-4 dark:text-gray-300'>Stats</h2>
      </div>
      <ProductionChart
        stats={stats}
        flock={flock}
        className={className}
        limit={limit}
        onRangeChange={onRangeChange}
      />
      <ExpenseChart stats={stats} className={className} />
    </div>
  );
}

function ProductionChart({
  stats,
  flock,
  className,
  limit,
  onRangeChange,
}: {
  stats: any | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  limit: string;
  onRangeChange: any;
}) {
  function chartData(logs: any[], flock: Flock & { breeds: Breed[] }) {
    const flockDailyAverage = calcDailyAverage(flock);
    const chartArray = createChartArray(logs, Number(limit));

    return {
      datasets: [
        {
          data: chartArray.map((i: any) => i._sum.count),
          label: "Egg Production",
          backgroundColor: "rgba(39,166,154,0.2)",
          borderColor: "rgba(39,166,154,1)",
          pointBackgroundColor: "rgba(39,166,154,0.8)",
          pointBorderColor: "rgba(39,166,154,0.8)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
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

  function createChartArray(logs: any[], limit: number) {
    const dates = getDatesInRange(Number(limit));
    const logsArray = logs.map((log) => {
      return {
        ...log,
        date: log.date.toLocaleString("us-EN", {
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

      const index = logsArray.map((l) => l.date).indexOf(stringValue);

      if (index >= 0) {
        return {
          ...logsArray[index],
        };
      } else {
        return {
          date: stringValue,
          _sum: {
            count: 0,
          },
        };
      }
    });

    return retArray;
  }

  function calcDailyAverage(flock: Flock & { breeds: Breed[] }): number {
    const breedAverages = flock.breeds.length
      ? flock.breeds.map((breed) => (breed.averageProduction * breed.count) / 7)
      : [0];
    const dailyAverage = breedAverages.reduce((a, b) => a + b);

    return dailyAverage;
  }

  function calcActualDailyAverage(logs: any[]) {
    const average = logs.length
      ? logs.map((l) => l._sum.count).reduce((a, b) => a + b) / logs.length
      : 0;

    return average;
  }

  function getDatesInRange(limit: number) {
    const retArray: Date[] = [];

    for (let i: number = limit - 1; i >= 0; i--) {
      const today = new Date(Date.now());
      retArray.push(new Date(today.setDate(today.getDate() - i)));
    }

    return retArray;
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
  };

  const targetDailyAvg = calcDailyAverage(flock);
  const actualDailyAvg = calcActualDailyAverage(stats.logs);

  return (
    <div className={className}>
      <div className='flex justify-between'>
        <h3 className='mb-4 dark:text-gray-300'>Production</h3>
        <select defaultValue={limit} onChange={onRangeChange} className='mb-4'>
          <option value='7'>Last 7 Days</option>
          <option value='15'>Last 15 Days</option>
          <option value='30'>Last 30 Days</option>
        </select>
      </div>
      <div className='flex flex-col'>
        <div className='w-[99%] min-h-[300px] md:min-h-[275px]'>
          <Line
            data={chartData(stats.logs, flock)}
            options={options}
            id='productionChart'></Line>
        </div>
        <div className='p-2'></div>
        <div className='flex justify-between'>
          <div className='dark:text-gray-300'>
            Target Daily Avg: {targetDailyAvg.toFixed(2)}
          </div>
          <div className='flex items-center dark:text-gray-300'>
            Actual Daily Avg:
            <span className='ml-1'>{actualDailyAvg.toFixed(2)}</span>
            <span className='ml-1'>
              {actualDailyAvg < targetDailyAvg ? (
                <MdArrowDownward className='text-red-600' />
              ) : (
                <MdArrowUpward className=' text-green-600' />
              )}
            </span>
          </div>
        </div>
        <div className='flex justify-between dark:text-gray-300'>
          <div>
            Last Weeks Avg:{" "}
            {stats.lastWeekAvg._avg.count
              ? stats.lastWeekAvg._avg.count.toFixed(2)
              : "n/a"}
          </div>
          <div className='flex items-center dark:text-gray-300'>
            This Weeks Avg:
            <span className='ml-1'>
              {stats.thisWeekAvg._avg.count?.toFixed(2)}
            </span>
            <span className='ml-1'>
              {stats.thisWeekAvg._avg.count < stats.lastWeekAvg._avg.count ? (
                <MdOutlineTrendingDown className='text-red-600' />
              ) : (
                <MdOutlineTrendingUp className=' text-green-600' />
              )}
            </span>
          </div>
        </div>
        <div className='p-2'></div>
        <Link href='/logs'>
          <a className='text-stone-400 hover:text-stone-700 transition-colors'>
            See all logs &gt;
          </a>
        </Link>
      </div>
    </div>
  );
}

function ExpenseChart({
  stats,
  className,
}: {
  stats: any | null | undefined;
  className: string;
}) {
  function chartData(stats: { expenses: any[]; production: any[] }) {
    const chartArray = createChartArray(stats.expenses);
    const prodArray = createProdOverlayArray(stats.production);

    console.log("Chart Array: ", chartArray);
    console.log("Prod Array: ", prodArray);

    return {
      datasets: [
        {
          data: chartArray.filter((i) => i.Cat == "feed").map((i) => i.Tot),
          label: "Feed",
          backgroundColor: "rgba(39,70,84,0.75)",
          // borderColor: "rgba(39,166,154,1)",
          // pointBackgroundColor: "rgba(39,166,154,0.8)",
          // pointBorderColor: "rgba(39,166,154,0.8)",
          // pointHoverBackgroundColor: "#fff",
          // pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "bar" as const,
          yAxisID: "y",
          order: 2,
        },
        {
          data: chartArray
            .filter((i) => i.Cat == "suplements")
            .map((i) => i.Tot),
          label: "Suplements",
          backgroundColor: "rgba(39,166,154,0.75)",
          // borderColor: "rgba(39,166,154,1)",
          // pointBackgroundColor: "rgba(39,166,154,0.8)",
          // pointBorderColor: "rgba(39,166,154,0.8)",
          // pointHoverBackgroundColor: "#fff",
          // pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "bar" as const,
          yAxisID: "y",
          order: 2,
        },
        {
          data: chartArray
            .filter((i) => i.Cat == "medication")
            .map((i) => i.Tot),
          label: "Medication",
          backgroundColor: "rgba(231, 111, 82, 0.75)",
          // borderColor: "rgba(39,166,154,1)",
          // pointBackgroundColor: "rgba(39,166,154,0.8)",
          // pointBorderColor: "rgba(39,166,154,0.8)",
          // pointHoverBackgroundColor: "#fff",
          // pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "bar" as const,
          yAxisID: "y",
          order: 2,
        },
        {
          data: chartArray.filter((i) => i.Cat == "other").map((i) => i.Tot),
          label: "Other",
          backgroundColor: "rgba(244, 162, 98,0.75)",
          // borderColor: "rgba(39,166,154,1)",
          // pointBackgroundColor: "rgba(39,166,154,0.8)",
          // pointBorderColor: "rgba(39,166,154,0.8)",
          // pointHoverBackgroundColor: "#fff",
          // pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "bar" as const,
          yAxisID: "y",
          order: 2,
        },
        {
          data: prodArray.map((i) => i.Tot),
          label: "Egg Production",
          // backgroundColor: "rgba(39,166,154,0.2)",
          borderColor: "rgba(39,166,154,1)",
          pointBackgroundColor: "rgba(39,166,154,0.8)",
          pointBorderColor: "rgba(39,166,154,0.8)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "line" as const,
          yAxisID: "y1",
          order: 1,
        },
      ],
      labels: Array.from(new Set(chartArray.map((i: any) => i.MonthYear))),
    };
  }

  function getDatesWithCategories(dates: Date[]) {
    const retArray: { MonthYear: string; Cat: string }[] = [];
    const types = ["feed", "suplements", "medication", "other"];

    dates.forEach((date) => {
      types.forEach((type) => {
        retArray.push({
          MonthYear: `${date.getMonth() + 1}/${date.getFullYear()}`,
          Cat: type,
        });
      });
    });

    return retArray;
  }

  function createChartArray(expenses: any[]) {
    const dates = getDatesInRange(6);
    const datesAndCats = getDatesWithCategories(dates);
    const expenseArray = expenses as {
      MonthYear: string;
      Cat: string;
      Tot: number;
    }[];

    const retArray = datesAndCats.map((item) => {
      const index = expenseArray
        .map((e) => {
          return {
            MonthYear: e.MonthYear,
            Cat: e.Cat,
          };
        })
        .findIndex((res) => {
          return res.MonthYear == item.MonthYear && res.Cat == item.Cat;
        });

      if (index >= 0) {
        return {
          ...expenseArray[index],
        };
      } else {
        return {
          MonthYear: item.MonthYear,
          Cat: item.Cat,
          Tot: 0,
        };
      }
    });

    return retArray;
  }

  function createProdOverlayArray(production: any[]) {
    const dates = getDatesInRange(6);
    const dateStrings = dates.map((date) => {
      return {
        MonthYear: `${date.getMonth() + 1}/${date.getFullYear()}`,
      };
    });
    const productionArray = production as {
      MonthYear: string;
      Tot: number;
    }[];

    const retArray = dateStrings.map((item) => {
      const index = productionArray
        .map((e) => {
          return {
            MonthYear: e.MonthYear,
          };
        })
        .findIndex((res) => {
          return res.MonthYear == item.MonthYear;
        });

      if (index >= 0) {
        return {
          ...productionArray[index],
        };
      } else {
        return {
          MonthYear: item,
          Tot: 0,
        };
      }
    });

    return retArray;
  }

  function getDatesInRange(limit: number) {
    const retArray: Date[] = [];

    for (let i: number = limit - 1; i >= 0; i--) {
      const today = new Date(Date.now());
      retArray.push(subMonths(today, i));
    }

    return retArray;
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
      x: {
        stacked: true,
      },
      y: {
        startAtZero: true,
        stacked: true,
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value: any) {
            return "$" + value;
          },
        },
      },
      y1: {
        // type: "linear" as const,
        display: true,
        position: "right" as const,
        // stacked: false,

        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    },
  };

  return (
    <div className={className}>
      <div className='flex justify-between'>
        <h3 className='my-4 dark:text-gray-300'>Expenses</h3>
        {/* <select defaultValue={limit} onChange={onRangeChange} className='mb-4'>
          <option value='7'>Last 7 Days</option>
          <option value='15'>Last 15 Days</option>
          <option value='30'>Last 30 Days</option>
        </select> */}
      </div>
      <div className='flex flex-col'>
        <div className='w-[99%] min-h-[300px] md:min-h-[275px]'>
          <Chart
            type='bar'
            data={chartData(stats.expenses)}
            options={options}
            id='expenseChart'></Chart>
        </div>
        {/* <div className='p-2'></div>
        <div className='flex justify-between'>
          <div className='dark:text-gray-300'>
            Target Daily Avg: {targetDailyAvg.toFixed(2)}
          </div>
          <div className='flex items-center dark:text-gray-300'>
            Actual Daily Avg:
            <span className='ml-1'>{actualDailyAvg.toFixed(2)}</span>
            <span className='ml-1'>
              {actualDailyAvg < targetDailyAvg ? (
                <MdArrowDownward className='text-red-600' />
              ) : (
                <MdArrowUpward className=' text-green-600' />
              )}
            </span>
          </div>
        </div> */}
        {/* <div className='flex justify-between dark:text-gray-300'>
          <div>
            Last Weeks Avg:{" "}
            {stats.lastWeekAvg._avg.count
              ? stats.lastWeekAvg._avg.count.toFixed(2)
              : "n/a"}
          </div>
          <div className='flex items-center dark:text-gray-300'>
            This Weeks Avg:
            <span className='ml-1'>
              {stats.thisWeekAvg._avg.count?.toFixed(2)}
            </span>
            <span className='ml-1'>
              {stats.thisWeekAvg._avg.count < stats.lastWeekAvg._avg.count ? (
                <MdOutlineTrendingDown className='text-red-600' />
              ) : (
                <MdOutlineTrendingUp className=' text-green-600' />
              )}
            </span>
          </div>
        </div> */}
        <div className='p-2'></div>
        <Link href='/expenses'>
          <a className='text-stone-400 hover:text-stone-700 transition-colors'>
            See all expenses &gt;
          </a>
        </Link>
      </div>
    </div>
  );
}
